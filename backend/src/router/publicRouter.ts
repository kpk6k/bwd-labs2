import { Router } from 'express';
import { getEvents, getEvent } from '../controller/eventController';

const publicRouter = Router();

// Public route GET /events
publicRouter.get('/events', getEvents);
publicRouter.get('/events/:eventId', getEvent);

export { publicRouter };
