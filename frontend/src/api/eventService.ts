import axiosInstance from './axios';
import type {Event} from '../types/event';

export interface GetEventsParams {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
}

export interface EventsResponse {
    total: number;
    page: number;
    limit: number;
    data: Event[];
}

export const getEvents = async (
    params?: GetEventsParams
): Promise<EventsResponse> => {
    const response = await axiosInstance.get<EventsResponse>('/events', {
        params: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            includeDeleted: params?.includeDeleted || false,
        },
    });
    return response.data;
};

export const getEventById = async (id: number): Promise<Event> => {
    const response = await axiosInstance.get<Event>(`/events/id/${id}`);
    return response.data;
};

export const createEvent = async (
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Event> => {
    const response = await axiosInstance.post<Event>('/events', eventData);
    return response.data;
};

export const deleteEvent = async (
    id: number
): Promise<{message: string; deletedAt?: string}> => {
    console.log('Deleting event with id:', id);
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
};

export const restoreEvent = async (id: number): Promise<{message: string}> => {
    const response = await axiosInstance.post(`/events/${id}/restore`);
    return response.data;
};
