import React from 'react';
import styles from './Modal.module.css'
import DOMPurify from 'dompurify';

function Modal({ open, onClose, book }) {
    if (!open) return null;

    // const overlayStyle = {
    //     position: 'fixed',
    //     inset: 0,
    //     backgroundColor: 'rgba(0,0,0,0.5)',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     zIndex: 1000,
    // };

    // const contentStyle = {
    //     position: 'relative',
    //     background: '#fff',
    //     padding: '1.25rem',
    //     borderRadius: '8px',
    //     maxWidth: '90%',
    //     width: 900,
    //     boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
    // };

    // const closeStyle = {
    //     position: 'absolute',
    //     top: 8,
    //     right: 10,
    //     border: 'none',
    //     background: 'transparent',
    //     fontSize: '1.25rem',
    //     cursor: 'pointer',
    //     lineHeight: 1
    // };

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <button aria-label="Close" onClick={onClose} className={styles.closeButton}>×</button>
                {book && (
                    <div className={styles.bookDetails}>
                        <div className={styles.bookImgBox} >
                            {book.Images?.[0] && (
                                <img src={book.Images[0]} alt={book.BookType} />
                            )}
                        </div>
                        <div className={styles.bookTextBox}>
                            <h2>{book.Title}</h2>
                            <p>{book.Language}</p>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(book.Description, {
                                        ADD_TAGS: ['style', 'script'],
                                        ADD_ATTR: ['type'],
                                        ALLOW_UNKNOWN_PROTOCOLS: true
                                    })
                                }}
                            />
                            <p>ISBN: {book.ISBN}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;
