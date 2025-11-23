import Router from 'express';
import passport from 'passport';
import { requireJwt } from '../database/config/passport.js';
import { getUsers, createUser} from '../controller/userController.js';
import {
    createEvent,
    updateEvent,
    deleteEvent
} from '../controller/eventController.js';

const router = new Router();

//router.use(passport.authenticate("jwt", { session: false }));
router.post('/events/', requireJwt, createEvent);
router.put('/events/:eventId', requireJwt, updateEvent);
router.delete('/events/:eventId', requireJwt, deleteEvent);
router.get('/users', requireJwt, getUsers);
router.post('/users', requireJwt, createUser);

export default router;
