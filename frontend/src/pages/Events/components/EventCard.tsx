import React, {useState, useRef, useEffect} from 'react';
import type {Event} from '../../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
    event: Event;
    onDelete: (id: number) => void;
    currentUserId?: number;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    onDelete,
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

    const date = new Date(event.date).toLocaleString();

    const authorName = event.user?.name || 'Unknown';
    const isAuthor = currentUserId === event.createdBy;
    console.log(event.createdBy);

    return (
        <div className={styles.card} onClick={handleCardClick} ref={cardRef}>
            <h3 className={styles.title}>{event.title}</h3>
            <div className={styles.author}>
                <span className={styles.authorLabel}>Created by:</span>
                <span className={styles.authorName}>{authorName}</span>
            </div>
            {event.description && (
                <p className={styles.description}>{event.description}</p>
            )}
            <p className={styles.date}>Date: {date}</p>
            {isClicked && isAuthor && (
                <div className={styles.deleteButtonContainer}>
                    <button
                        className={styles.deleteButton}
                        onClick={handleDeleteClick}
                    >
                        Delete
                    </button>
                </div>
            )}

            {isClicked && !isAuthor && (
                <div className={styles.infoMessage}>
                    You can only delete your own events
                </div>
            )}
        </div>
    );
};

export default EventCard;
