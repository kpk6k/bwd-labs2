import { Request, Response, NextFunction } from 'express';
import eventModel from '../database/model/eventModel.js';
import User from '../database/model/userModel.js';

export const toggleParticipant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventIdStr = req.params.eventId as string;
		const eventId = parseInt(eventIdStr, 10);
        const userId = (req.user as any).id;

        const event = await eventModel.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Нельзя участвовать в своем событии
        if (event.createdBy === userId) {
            return res.status(400).json({ message: 'Cannot join your own event' });
        }

        // Получаем текущий массив участников
        const participants = event.participants || [];
        
        // Проверяем, уже ли участвует
        const isParticipant = participants.includes(userId);
        
        if (isParticipant) {
            // Удаляем из участников
            event.participants = participants.filter(id => id !== userId);
            await event.save();
            res.json({ 
                message: 'Successfully left event',
                isParticipant: false,
                participantsCount: event.participants.length
            });
        } else {
            // Добавляем в участники
            event.participants = [...participants, userId];
            await event.save();
            res.json({ 
                message: 'Successfully joined event',
                isParticipant: true,
                participantsCount: event.participants.length
            });
        }
    } catch (err) {
        next(err);
    }
};

export const getEventParticipants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventIdStr = req.params.eventId as string;
		const eventId = parseInt(eventIdStr, 10);

        const event = await eventModel.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const participants = event.participants || [];
        
        if (participants.length === 0) {
            return res.json([]);
        }

        const users = await User.findAll({
            where: { id: participants },
            attributes: ['id', 'name', 'email']
        });

        res.json(users);
    } catch (err) {
        next(err);
    }
};

export const checkParticipation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventIdStr = req.params.eventId as string;
		const eventId = parseInt(eventIdStr, 10);
        const userId = (req.user as any).id;

        const event = await eventModel.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const participants = event.participants || [];
        const isParticipant = participants.includes(userId);

        res.json({ isParticipant });
    } catch (err) {
        next(err);
    }
};
