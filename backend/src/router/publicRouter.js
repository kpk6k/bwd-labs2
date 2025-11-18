import Router from "express";
import { getEvents, getEvent } from '../controller/eventController.js';

const publicRouter = new Router();

// Public route GET /events
publicRouter.get("/events", getEvents);
publicRouter.get('/events/:eventId', getEvent);

export default publicRouter;
