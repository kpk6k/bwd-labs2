import axiosInstance from './axios';
import type { Participant } from '../types/event';

export const toggleParticipant = async (eventId: number): Promise<{ 
    message: string; 
    isParticipant: boolean;
    participantsCount: number;
}> => {
    const response = await axiosInstance.post(`/events/${eventId}/toggle`);
    return response.data;
};

export const getEventParticipants = async (eventId: number): Promise<Participant[]> => {
    const response = await axiosInstance.get(`/events/${eventId}/participants`);
    return response.data;
};

export const checkParticipation = async (eventId: number): Promise<{ isParticipant: boolean }> => {
    const response = await axiosInstance.get(`/events/${eventId}/check`);
    return response.data;
};
