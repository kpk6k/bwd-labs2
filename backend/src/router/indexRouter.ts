import { Router } from 'express';
//import passport from 'passport';
import { requireJwt } from '../database/config/passport.js';
import { getUsers, createUser } from '../controller/userController.js';
import {
    createEvent,
    updateEvent,
    deleteEvent,
    restoreEvent,
    getMyEvents,
} from '../controller/eventController.js';

const router = Router();

//router.use(passport.authenticate("jwt", { session: false }));
router.post('/events/', requireJwt, createEvent);
router.put('/events/:eventId', requireJwt, updateEvent);
router.delete('/events/:eventId', requireJwt, deleteEvent);
router.post('/events/:eventId/restore', requireJwt, restoreEvent);
router.get('/users', requireJwt, getUsers);
router.get('/eventsmy', requireJwt, getMyEvents);
router.post('/users', requireJwt, createUser);

export { router };
