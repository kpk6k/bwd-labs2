import eventModel from "../database/model/eventModel.js";
import userModel from "../database/model/userModel.js";


/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of all events
 *       500:
 *         description: Internal server error
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
 * /events/id/{eventId}:
 *   get:
 *     summary: Get a specific event by ID
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event details
 *       400:
 *         description: Event not found
 *       500:
 *         description: Internal server error
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
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: integer
 *               category:
 *                 type: string
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *               - category
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Missing required fields, illegal category, or invalid date format
 *       500:
 *         description: Internal server error
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
 *     summary: Update an existing event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Event not found or invalid date format
 *       500:
 *         description: Internal server error
 */

const updateEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params
        const { title, description, date, createdBy, categoryId } = req.body

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
 *     summary: Delete an event
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       400:
 *         description: Event not found
 *       500:
 *         description: Internal server error
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
