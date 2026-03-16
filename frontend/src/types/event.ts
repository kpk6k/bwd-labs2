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
}
