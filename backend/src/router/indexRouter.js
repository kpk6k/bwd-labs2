import Router from 'express';
import passport from 'passport';
import { getUsers, createUser} from '../controller/userController.js';
import {
    createEvent,
    updateEvent,
    deleteEvent
} from '../controller/eventController.js';

const router = new Router();

router.use(passport.authenticate("jwt", { session: false }));
router.post('/events/', createEvent);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);
router.get('/users', getUsers);
router.post('/users', createUser);

export default router;
