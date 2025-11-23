import eventModel from "../database/model/eventModel.js";
import userModel from "../database/model/userModel.js";


/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get paginated list of events
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
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

const getEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
		if (pageNumber < 1 || limitNumber < 1) {
    		return res.status(400).json({ message: "page and limit must be positive integers." });
		}

        const offset = (pageNumber - 1) * limitNumber;

        const events = await eventModel.findAndCountAll({
            limit: limitNumber,
            offset: offset,
            include: [{
                model: userModel,
                attributes: ['id', 'name']
            }]
        });

        return res.status(200).json({
            total: events.count,
            page: pageNumber,
            limit: limitNumber,
            data: events.rows,
        });
    } catch (e) {
        next(e)
    }
}

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get single event by id
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
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

const getEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params

        if(!eventId) {
            return res.status(400).json({ message: "'eventId' required" })
        }

        const filter = {}
        filter.id = eventId

        const event = await eventModel.findOne({
            where: filter,
            include: [{
                model: userModel,
                attributes: ['id', 'name']
            }]
        })

        if(!event) {
            return res.status(400).json({ message: `Event No. ${ eventId } not found` })
        }

        return res.status(200).json(event)
    } catch(err) {
        next(err)
    }
}

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
 *               createdBy:
 *                 type: integer
 *                 example: 1
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

const createEvent = async (req, res, next) => {
    try {
        const { title, description, date, createdBy } = req.body

        if (!title || !date || !createdBy) {
            return res.status(400).json({
                message: "Fields 'title', 'date', 'createdBy' required"
            })
        }

        const eventDate = new Date(date)
        if (isNaN(eventDate.getTime())) {
            return res.status(400).json({
                message: "invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ "
            })
        }

		const user = await userModel.findByPk(createdBy);
    	if (!user) {
      		return res.status(404).json({ message: `User with id ${createdBy} not found` });
    	}

        const event = await eventModel.create({
            title,
            description,
            date,
            createdBy
        })

        return res.status(201).json(event)
    } catch(err) {
        next(err)
    }
}

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

const updateEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params
        const { title, description, date, createdBy } = req.body

        let eventDate = null

        if (date) {
            eventDate = new Date(date)
            if (isNaN(eventDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ "
                })
            }
        }

        const event = await eventModel.findOne({ where: { id: eventId } })

        if (!event) {
            return res.status(400).json({ message: `Event ${eventId} not found` })
        }

        event.id = eventId || event.id
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.createdBy = createdBy || event.createdBy;
        await event.save()

        return res.status(200).json(event)
    } catch(err) {
        next(err)
    }
}

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


const deleteEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params

        const event = await eventModel.findOne({ where: { id: eventId } })

        if (!event) {
            return res.status(400).json({ message: `Event No. ${eventId} not found` })
        }

        await event.destroy()

        return res.status(200).send()
    } catch(err) {
        next(err)
    }
}

export { getEvents, getEvent, createEvent, updateEvent, deleteEvent }
