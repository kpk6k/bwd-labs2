import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {
    fetchMyEvents,
    deleteEvent,
    updateEvent,
    clearError,
} from '../../store/slices/eventsSlice';
import EventCard from '../Events/components/EventCard';
import EventForm from '../../components/EventForm/EventForm';
import type {EventFormValues} from '../../components/EventForm/EventForm';
import Loading from '../../components/Loading/Loading';
import ErrorDisplay from '../../components/ErrorDisplay/ErrorDisplay';
import Button from '../../components/Button/Button';
import type {Event} from '../../types/event';
import styles from './Profile.module.scss';

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {user} = useAppSelector((state) => state.auth);
    const {myEvents, loading, error} = useAppSelector((state) => state.events);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
		console.log('1. Fetching my events for user:', user.id);
        dispatch(fetchMyEvents())
			.unwrap()
			.then((result) => {
				console.log('2. Fetch successful, events:', result);
		})
		.catch((error) => {
			console.error('3. Fetch failed:', error);
		});
        return () => {
            dispatch(clearError());
        };
    }, [dispatch, user, navigate]);

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setSubmitting(true);
        try {
            await dispatch(deleteEvent(deleteId)).unwrap();
            setDeleteId(null);
        } catch {
            // error handled
        } finally {
            setSubmitting(false);
        }
    };

    const cancelDelete = () => setDeleteId(null);

    const handleEditEvent = (id: number) => {
		console.log('Edit event clicked with id:', id);
        const event = myEvents.find((e) => e.id === id);
        if (event) {
            setEditingEvent(event);
            setEditModalOpen(true);
        }
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingEvent(null);
    };

    const handleEventUpdate = async (data: EventFormValues) => {
        if (!editingEvent) return;
        setSubmitting(true);
		console.log('Updating event:', editingEvent.id);
        console.log('Update data:', data);
        try {
            const payload = {
                ...data,
                description: data.description || null,
            };
            await dispatch(
                updateEvent({id: editingEvent.id, data: payload})
            ).unwrap();
            closeEditModal();
        } catch (err: any) {
            setUpdateError(err.message || 'Failed to update event');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className={styles.profile}>
            <div className={styles.header}>
                <h1>My Profile</h1>
            </div>
            <div className={styles.info}>
                <p>
                    <strong>Name:</strong> {user.name}
                </p>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
            </div>

            <h2>My Events</h2>
            <ErrorDisplay
                message={error}
                onClose={() => dispatch(clearError())}
            />
            {loading && <Loading />}
            {!loading && myEvents.length === 0 && (
                <p className={styles.empty}>
                    You haven't created any events yet.
                </p>
            )}
            <div className={styles.grid}>
                {myEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onDelete={handleDeleteClick}
                        onEdit={handleEditEvent}
						currentUserId={user?.id}
                    />
                ))}
            </div>
            {/* Edit Event Modal */}
            {editModalOpen && editingEvent && (
                <div className={styles.modalOverlay} onClick={closeEditModal}>
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Edit Event</h3>
                        <ErrorDisplay
                            message={updateError}
                            onClose={() => setUpdateError(null)}
                        />
                        <EventForm
                            initialValues={{
                                title: editingEvent.title,
                                description: editingEvent.description || '',
                                date: editingEvent.date,
                            }}
                            onSubmit={handleEventUpdate}
                            onCancel={closeEditModal}
                            isSubmitting={submitting}
                        />
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteId && (
                <div className={styles.modalOverlay} onClick={cancelDelete}>
                    <div
                        className={`${styles.modal} ${styles.deleteModal}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Confirm Delete</h3>
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

export default Profile;
