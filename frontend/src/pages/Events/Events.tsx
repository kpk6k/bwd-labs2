import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {getEvents, createEvent, deleteEvent, restoreEvent} from '../../api/eventService';
import {useAuth} from '../../contexts/AuthContext';
import EventCard from './components/EventCard';
import Button from '../../components/Button/Button';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Events.module.scss';
import type {Event} from '../../types/event';

type DateFilter = 'all' | 'today' | 'week' | 'month';

// Helper to extract error message from unknown error
const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
        const err = error as any;
        return (
            err.response?.data?.message || err.message || 'An error occurred'
        );
    }
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
};

// Интерфейс для ответа с пагинацией
/*interface EventsResponse {
  total: number;
  page: number;
  limit: number;
  data: Event[];
}
*/
const Events: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [showDeleted, setShowDeleted] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
    });
    const navigate = useNavigate();
    const {user, isLoading: authLoading} = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            fetchEvents();
        }
    }, [
        user,
        authLoading,
        navigate,
        pagination.page,
        pagination.limit,
        showDeleted,
    ]);

    const fetchEvents = useCallback(async () => {
        try {
            const response = await getEvents({
                page: pagination.page,
                limit: pagination.limit,
                includeDeleted: showDeleted,
            });

            if (response && typeof response === 'object') {
                if ('data' in response && Array.isArray(response.data)) {
                    setEvents(response.data);
                    setPagination({
                        total: response.total || 0,
                        page: response.page || 1,
                        limit: response.limit || 10,
                    });
                } else if (Array.isArray(response)) {
                    // Простой массив событий
                    setEvents(response);
                } else {
                    console.error('Неизвестный формат ответа:', response);
                    setEvents([]);
                }
            } else {
                setEvents([]);
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, showDeleted]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            const dateIso = new Date(formData.date).toISOString();
            await createEvent({
                title: formData.title,
                description: formData.description || null,
                date: dateIso,
                createdBy: user.id,
            });
            setModalOpen(false);
            setFormData({
                title: '',
                description: '',
                date: '',
            });
            fetchEvents();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        console.log('Delete clicked for event id:', id);
        setEventToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleRestoreClick = async (id: number) => {
        try {
            setSubmitting(true);
            await restoreEvent(id);
            fetchEvents();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        setSubmitting(true);
        try {
            await deleteEvent(eventToDelete);
            setDeleteModalOpen(false);
            setEventToDelete(null);
            fetchEvents();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            setDeleteModalOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setEventToDelete(null);
    };

    // Date filter logic – fixed no-case-declarations by using {}
    const filteredEvents = useMemo(() => {
        if (dateFilter === 'all') return events;

        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        return events.filter((event) => {
            const eventDate = new Date(event.date);
            switch (dateFilter) {
                case 'today': {
                    const tomorrow = new Date(today.getTime() + 86400000);
                    return eventDate >= today && eventDate < tomorrow;
                }
                case 'week': {
                    const weekAgo = new Date(today.getTime() - 7 * 86400000);
                    return eventDate >= weekAgo;
                }
                case 'month': {
                    const monthAgo = new Date(today.getTime() - 30 * 86400000);
                    return eventDate >= monthAgo;
                }
                default:
                    return true;
            }
        });
    }, [events, dateFilter]);

    if (authLoading)
        return <div className={styles.loading}>Checking authentication...</div>;
    if (loading) return <div className={styles.loading}>Loading events...</div>;

    return (
        <div className={styles.events}>
            <h1>Events</h1>
            {pagination.total > 0 && (
                <div className={styles.paginationInfo}>
                    Total events: {pagination.total}
                </div>
            )}
            <ErrorDisplay message={error} onClose={() => setError(null)} />

            <div className={styles.controls}>
                <div className={styles.filterGroup}>
                    <div className={styles.filter}>
                        <label htmlFor="dateFilter">Show: </label>
                        <select
                            id="dateFilter"
                            value={dateFilter}
                            onChange={(e) =>
                                setDateFilter(e.target.value as DateFilter)
                            }
                            disabled={submitting}
                        >
                            <option value="all">All</option>
                            <option value="today">Today</option>
                            <option value="week">This week</option>
                            <option value="month">This month</option>
                        </select>
                    </div>

                    <div className={styles.toggleSwitch}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={showDeleted}
                                onChange={(e) => {
                                    setShowDeleted(e.target.checked);
                                    setPagination((prev) => ({
                                        ...prev,
                                        page: 1,
                                    }));
                                }}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={styles.toggleLabel}>
                            Show deleted events
                        </span>
                    </div>
                </div>

                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    New event
                </Button>
            </div>

            {events.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyMessage}>
                        {showDeleted
                            ? 'No deleted events found'
                            : 'No events yet'}
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => setModalOpen(true)}
                    >
                        New event
                    </Button>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className={styles.noMatch}>
                    No events match the selected filter.
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onDelete={handleDeleteClick}
                            onRestore={handleRestoreClick}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}

            {pagination.total > pagination.limit && (
                <div className={styles.pagination}>
                    <Button
                        variant="secondary"
                        onClick={() =>
                            setPagination((prev) => ({
                                ...prev,
                                page: prev.page - 1,
                            }))
                        }
                        disabled={pagination.page === 1 || submitting}
                    >
                        Previous
                    </Button>
                    <span className={styles.pageInfo}>
                        Page {pagination.page} of{' '}
                        {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <Button
                        variant="secondary"
                        onClick={() =>
                            setPagination((prev) => ({
                                ...prev,
                                page: prev.page + 1,
                            }))
                        }
                        disabled={
                            pagination.page >=
                                Math.ceil(
                                    pagination.total / pagination.limit
                                ) || submitting
                        }
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Create Event Modal */}
            {modalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Create New Event</h3>
                        <form onSubmit={handleCreateEvent}>
                            <div className={styles.field}>
                                <label htmlFor="title">Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="date">Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setModalOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className={styles.modalOverlay} onClick={cancelDelete}>
                    <div
                        className={`${styles.modal} ${styles.deleteModal}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this event?</p>
                        <div className={styles.modalActions}>
                            <Button
                                variant="secondary"
                                onClick={cancelDelete}
                                disabled={submitting}
                            >
                                No
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmDelete}
                                disabled={submitting}
                            >
                                Yes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
