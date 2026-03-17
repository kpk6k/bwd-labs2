export interface Participant {
    id: number;
    name: string;
    email: string;
    joinedAt?: string;
}

export interface Event {
    id: number;
    title: string;
    description: string | null;
    date: string;
    createdBy: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    user?: {
        name: string;
    };
	participantsCount?: number;
    participants?: Participant[];
}
