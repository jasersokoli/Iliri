import { useEffect, useRef } from 'react';
import './Modal.css';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  allowClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  allowClose = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && allowClose) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose, allowClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={allowClose ? onClose : undefined}>
      <div
        className={`modal-container modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {title && (
          <>
          <h2 className="modal-title modal-title-large print-only">MATERIALE ELEKTRIKE ILIRI</h2>
          <h3 className="print-only-small">RRUGA BUJAR BISHANAKU, PRANE STADIUMIT</h3>
          <h3 className="print-only-small">CEL 355 69 20 74 808</h3>

          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            {allowClose && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
          </>
        )}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

