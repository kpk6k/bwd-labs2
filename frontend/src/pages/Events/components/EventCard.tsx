import React, {useState, useRef, useEffect} from 'react';
import type {Event} from '../../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
    event: Event;
    onDelete: (id: number) => void;
    onRestore?: (id: number) => void;
    currentUserId?: number;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    onDelete,
	onRestore,
    currentUserId,
}) => {
    const [isClicked, setIsClicked] = useState(false);
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

    const handleRestoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRestore) {
            onRestore(event.id);
        }
        setIsClicked(false);
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
                    ) : (
                        isAuthor ? (
                            <button
                                className={styles.deleteButton}
                                onClick={handleDeleteClick}
                            >
                                Delete Event
                            </button>
                        ) : (
                            <div className={styles.infoMessage}>
                                You can only delete your own events
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default EventCard;
