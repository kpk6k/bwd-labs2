import { Request, Response, NextFunction } from 'express';
import eventModel from '../database/model/eventModel.js';
import User from '../database/model/userModel.js';

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get paginated list of events
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (must be >= 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (must be >= 1)
 *     responses:
 *       200:
 *         description: Paginated events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request (invalid page/limit)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, includeDeleted = 'false' } = req.query;
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const showDeleted = includeDeleted === 'true';
        if (pageNumber < 1 || limitNumber < 1) {
            return res
                .status(400)
                .json({ message: 'page and limit must be positive integers.' });
        }

        const offset = (pageNumber - 1) * limitNumber;

        const queryOptions: any = {
            attributes: [
                'id',
                'title',
                'description',
                'date',
                'createdBy',
                'deletedAt',
            ],
            limit: limitNumber,
            offset: offset,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                },
            ],
            paranoid: !showDeleted,
        };

        if (showDeleted) {
            queryOptions.order = [
                ['deletedAt', 'ASC NULLS FIRST'],
                ['createdAt', 'DESC'],
            ];
        }

        const events = await eventModel.findAndCountAll(queryOptions);

        const eventsWithStatus = events.rows.map((event) => ({
            ...event.toJSON(),
            isDeleted: event.deletedAt !== null,
        }));

        return res.status(200).json({
            total: events.count,
            page: pageNumber,
            limit: limitNumber,
            showDeleted: showDeleted,
            data: eventsWithStatus,
        });
    } catch (e) {
        next(e);
    }
};

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get single event by id
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request / not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

const getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({ message: "'eventId' required" });
        }

        //const filterId = { eventId };
        //filter.id = eventId

        const event = await eventModel.findOne({
            attributes: ['title', 'description', 'date'],
            where: { id: eventId },
            include: [
                {
                    model: User,
                    attributes: ['name'],
                },
            ],
        });

        if (!event) {
            return res
                .status(400)
                .json({ message: `Event No. ${eventId} not found` });
        }

        return res.status(200).json(event);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create new event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Music Festival"
 *               description:
 *                 type: string
 *                 example: "Annual open-air festival"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T18:00:00.000Z"
 *     responses:
 *       201:
 *         description: Created event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fields 'title', 'date', 'createdBy' required"
 *       401:
 *         description: Unauthorized — missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, date } = req.body;
        const createdBy = (req.user as User).id;

        if (!title || !date) {
            return res.status(400).json({
                message: "Fields 'title', 'date', required",
            });
        }

        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
            return res.status(400).json({
                message:
                    'invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ ',
            });
        }

        const event = await eventModel.create({
            title,
            description,
            date,
            createdBy,
        });

		const eventWithUser = await eventModel.findByPk(event.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                },
            ],
        });

        return res.status(201).json(eventWithUser);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update event by id
 *     tags:
 *       - Events
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: ID of the event to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-02T18:00:00.000Z"
 *               createdBy:
 *                 type: integer
 *                 example: 1
 *           examples:
 *             updateTitle:
 *               summary: Update only title
 *               value:
 *                 title: "New Event Title"
 *             updateDescription:
 *               summary: Update only description
 *               value:
 *                 description: "Updated description for the event"
 *             updateDate:
 *               summary: Update only date
 *               value:
 *                 date: "2026-01-10T14:30:00.000Z"
 *             updateCreatedBy:
 *               summary: Update only createdBy
 *               value:
 *                 createdBy: 2
 *             fullUpdate:
 *               summary: Full update example
 *               value:
 *                 title: "Conference 2026"
 *                 description: "Annual tech conference"
 *                 date: "2026-03-15T09:00:00.000Z"
 *                 createdBy: 2
 *     responses:
 *       200:
 *         description: Updated event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event 123 not found"
 *       401:
 *         description: Unauthorized — missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;
        const { title, description, date } = req.body;

        let eventDate = null;

        if (date) {
            eventDate = new Date(date);
            if (isNaN(eventDate.getTime())) {
                return res.status(400).json({
                    message:
                        'Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ ',
                });
            }
        }

        const event = await eventModel.findOne({ where: { id: eventId } });

        if (!event) {
            return res
                .status(400)
                .json({ message: `Event ${eventId} not found` });
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        await event.save();

		const updatedEvent = await eventModel.findByPk(eventId, {
            include: [
                {
                    model: User,
                    attributes: ['name'],
                },
            ],
        });

        return res.status(200).json(updatedEvent);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete event by id
 *     tags:
 *       - Events
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: ID of the event
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully (empty body)
 *       400:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event No. 123 not found"
 *       401:
 *         description: Unauthorized — missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;

        const event = await eventModel.findOne({
            where: { id: eventId },
            paranoid: false,
        });

        if (!event) {
            return res
                .status(400)
                .json({ message: `Event No. ${eventId} not found` });
        }

        if (event.deletedAt) {
            return res
                .status(400)
                .json({ message: `Event No. ${eventId} is already deleted` });
        }

        await event.destroy();

        return res.status(200).json({
            message: `Event No. ${eventId} deleted (soft delete)`,
            deletedAt: new Date(),
        });
    } catch (err) {
        next(err);
    }
};

const restoreEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { eventId } = req.params;

        const event = await eventModel.findOne({
            where: { id: eventId },
            paranoid: false,
        });

        if (!event) {
            return res
                .status(400)
                .json({ message: `Event No. ${eventId} not found` });
        }

        if (!event.deletedAt) {
            return res
                .status(400)
                .json({ message: `Event No. ${eventId} is not deleted` });
        }

        await event.restore();

        return res.status(200).json({
            message: `Event No. ${eventId} restored`,
            event: {
                id: event.id,
                title: event.title,
                description: event.description,
                date: event.date,
            },
        });
    } catch (err) {
        next(err);
    }
};

const getMyEvents = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = (req.user as { id: number }).id;
        const events = await eventModel.findAll({
            where: { createdBy: userId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                },
            ],
        });
        res.status(200).json(events);
    } catch (err) {
        next(err);
    }
};

export {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    restoreEvent,
    getMyEvents,
};
