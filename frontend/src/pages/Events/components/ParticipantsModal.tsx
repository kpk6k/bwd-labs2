import React from 'react';
import type { Participant } from '../../../types/event';
import styles from './ParticipantsModal.module.scss';

interface ParticipantsModalProps {
    participants: Participant[];
    onClose: () => void;
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({ participants, onClose }) => {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3>Participants ({participants.length})</h3>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                
                <div className={styles.participantsList}>
                    {participants.length === 0 ? (
                        <p className={styles.empty}>No participants yet</p>
                    ) : (
                        participants.map(participant => (
                            <div key={participant.id} className={styles.participant}>
                                <div className={styles.avatar}>
                                    {participant.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>{participant.name}</div>
                                    <div className={styles.email}>{participant.email}</div>
                                    {participant.joinedAt && (
                                        <div className={styles.joinedAt}>
                                            Joined: {new Date(participant.joinedAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParticipantsModal;
