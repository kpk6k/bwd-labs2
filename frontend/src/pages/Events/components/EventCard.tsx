import React, {useState, useRef, useEffect} from 'react';
import type {Event} from '../../../types/event';
import styles from './EventCard.module.scss';
import { toggleParticipant, getEventParticipants } from '../../../api/participantService';
import ParticipantsModal from './ParticipantsModal';

interface EventCardProps {
    event: Event;
    onDelete: (id: number) => void;
	onEdit?: (id: number) => void;
    onRestore?: (id: number) => void;
    currentUserId?: number;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    onDelete,
	onEdit,
    onRestore,
    currentUserId,
}) => {
    const [isClicked, setIsClicked] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(event.participantsCount || 0);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                cardRef.current &&
                !cardRef.current.contains(e.target as Node)
            ) {
                setIsClicked(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCardClick = () => {
        setIsClicked((prev) => !prev);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(event.id);
        setIsClicked(false);
    };

	const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(event.id);
        }
        setIsClicked(false);
    };

    const handleRestoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRestore) {
            onRestore(event.id);
        }
        setIsClicked(false);
    };

	const handleJoinToggle = async (e: React.MouseEvent) => {
    	e.stopPropagation();
    	setLoading(true);
    	try {
        	const result = await toggleParticipant(event.id);
        	setIsParticipant(result.isParticipant);
        	setParticipantsCount(result.participantsCount);
    	} catch (error) {
        	console.error('Error toggling participation:', error);
    	} finally {
        	setLoading(false);
    	}
	};

	const handleParticipantsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const data = await getEventParticipants(event.id);
            setParticipants(data);
            setShowParticipantsModal(true);
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const date = new Date(event.date).toLocaleString();

    const authorName = event.user?.name || 'Unknown';
    const isAuthor = currentUserId === event.createdBy;
    const isDeleted = !!event.deletedAt;

    const deletedDate = event.deletedAt
        ? new Date(event.deletedAt).toLocaleString()
        : null;

    return (
        <div
            className={`${styles.card} ${isDeleted ? styles.deleted : ''}`}
            onClick={handleCardClick}
            ref={cardRef}
        >
            <h3 className={styles.title}>{event.title}</h3>

            <div className={styles.author}>
                <span className={styles.authorLabel}>Created by:</span>
                <span className={styles.authorName}>{authorName}</span>
            </div>

            {event.description && (
                <p className={styles.description}>{event.description}</p>
            )}

            <p className={styles.date}>Date: {date}</p>

			{!isDeleted && (
                    <div className={styles.participantsSection}>
                        <button
                            className={styles.participantsCount}
                            onClick={handleParticipantsClick}
                        >
                            {participantsCount} {participantsCount === 1 ? 'participant' : 'participants'}
                        </button>
                        
                        {!isAuthor && (
                            <button
                                className={`${styles.joinButton} ${isParticipant ? styles.leaveButton : ''}`}
                                onClick={handleJoinToggle}
                                disabled={loading}
                            >
                                {loading ? '...' : isParticipant ? 'Leave' : 'Join'}
                            </button>
                        )}
                    </div>
                )}

            {isDeleted && deletedDate && (
                <div className={styles.deletedInfo}>
                    <span className={styles.deletedLabel}>Deleted:</span>
                    <span className={styles.deletedDate}>{deletedDate}</span>
                </div>
            )}

            {isClicked && (
                <div className={styles.actionsContainer}>
                    {isDeleted ? (
                        onRestore && isAuthor ? (
                            <button
                                className={styles.restoreButton}
                                onClick={handleRestoreClick}
                            >
                                Restore Event
                            </button>
                        ) : (
                            <div className={styles.infoMessage}>
                                Only the author can restore this event
                            </div>
                        )
                    ) : isAuthor ? (
                       <div className={styles.buttonGroup}>
						{onEdit && (
                            <button
                                className={styles.editButton}
                                onClick={handleEditClick}
                            >
                                Edit Event
                            </button>
							)}
                            <button
                                className={styles.deleteButton}
                                onClick={handleDeleteClick}
                            >
                                Delete Event
                            </button>
                        </div>
                    ) : (
                        <div className={styles.infoMessage}>
                            You can only delete your own events
                        </div>
                    )}
                </div>
            )}
			{showParticipantsModal && (
                <ParticipantsModal
                    participants={participants}
                    onClose={() => setShowParticipantsModal(false)}
                />
            )}
        </div>

		            
    );
};

export default EventCard;
