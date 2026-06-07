import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// Icon component
function Ic({ n, fill = 0, size = 20, color }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
        color: color || "inherit",
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

// Tour overlay component
function TourOverlay({ step, onNext, onPrev, onClose, totalSteps, currentStep }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [arrowPosition, setArrowPosition] = useState('bottom');
  const overlayRef = useRef(null);

  useEffect(() => {
    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Calculate position based on placement
    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;
    let width = rect.width;
    let height = rect.height;
    let arrow = 'bottom';

    // Add spacing around the target
    const spacing = 8;
    top -= spacing;
    left -= spacing;
    width += spacing * 2;
    height += spacing * 2;

    // Determine arrow position based on available space
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (rect.top > viewportHeight / 2) {
      arrow = 'bottom';
    } else {
      arrow = 'top';
    }

    setPosition({ top, left, width, height });
    setArrowPosition(arrow);
  }, [step]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onNext, onPrev, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const overlayStyles = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    width: position.width,
    height: position.height,
    pointerEvents: 'none',
    zIndex: 9998,
  };

  const spotlightStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '8px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
    pointerEvents: 'none',
  };

  const tooltipStyles = {
    position: 'absolute',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '320px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    pointerEvents: 'auto',
    ... (arrowPosition === 'bottom' ? {
      top: position.height + 16,
      left: '50%',
      transform: 'translateX(-50%)',
    } : {
      bottom: position.height + 16,
      left: '50%',
      transform: 'translateX(-50%)',
    })
  };

  const arrowStyles = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    ... (arrowPosition === 'bottom' ? {
      top: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '0 8px 8px 8px',
      borderColor: 'transparent transparent var(--card) transparent',
    } : {
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '8px 8px 0 8px',
      borderColor: 'var(--card) transparent transparent transparent',
    })
  };

  return createPortal(
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9997,
        }}
        onClick={onClose}
      />

      {/* Highlight overlay */}
      <div style={overlayStyles}>
        <div style={spotlightStyles} />
      </div>

      {/* Tooltip */}
      <div ref={overlayRef} style={tooltipStyles}>
        <div style={arrowStyles} />
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Ic n="close" size={16} color="var(--text-muted)" />
        </button>

        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          {step.icon && (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: step.iconBg || 'rgba(13, 127, 242, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Ic n={step.icon} size={20} color={step.iconColor || '#0d7ff2'} fill={1} />
            </div>
          )}
          
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 8px',
            lineHeight: '1.3',
          }}>
            {step.title}
          </h3>
          
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: '1.5',
          }}>
            {step.content}
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          fontWeight: '600',
        }}>
          Step {currentStep + 1} of {totalSteps}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            style={{
              padding: '8px 16px',
              background: currentStep === 0 ? 'var(--border-light)' : 'transparent',
              color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep < totalSteps - 1 ? (
              <button
                onClick={onNext}
                style={{
                  padding: '8px 16px',
                  background: '#0d7ff2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Main TourGuide component
export default function TourGuide({ 
  steps = [], 
  isOpen = false, 
  onClose, 
  onComplete,
  startStep = 0 
}) {
  const [currentStep, setCurrentStep] = useState(startStep);
  const [isRunning, setIsRunning] = useState(isOpen);

  useEffect(() => {
    setIsRunning(isOpen);
    if (isOpen) {
      setCurrentStep(startStep);
    }
  }, [isOpen, startStep]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    setIsRunning(false);
    onClose?.();
  }, [onClose]);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    onComplete?.();
    onClose?.();
  }, [onComplete, onClose]);

  if (!isRunning || steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];
  if (!currentStepData) {
    return null;
  }

  return (
    <TourOverlay
      step={currentStepData}
      onNext={handleNext}
      onPrev={handlePrev}
      onClose={handleClose}
      totalSteps={steps.length}
      currentStep={currentStep}
    />
  );
}

// Tour hook for managing tour state
export function useTour(steps = []) {
  const [isOpen, setIsOpen] = useState(false);
  const [completedTours, setCompletedTours] = useState(() => {
    const saved = localStorage.getItem('completedTours');
    return saved ? JSON.parse(saved) : {};
  });

  const startTour = useCallback((tourId) => {
    if (!completedTours[tourId]) {
      setIsOpen(true);
    }
  }, [completedTours]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const completeTour = useCallback((tourId) => {
    setCompletedTours(prev => {
      const updated = { ...prev, [tourId]: true };
      localStorage.setItem('completedTours', JSON.stringify(updated));
      return updated;
    });
    setIsOpen(false);
  }, []);

  const resetTour = useCallback((tourId) => {
    setCompletedTours(prev => {
      const updated = { ...prev };
      delete updated[tourId];
      localStorage.setItem('completedTours', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    isOpen,
    startTour,
    closeTour,
    completeTour,
    resetTour,
    isTourCompleted: (tourId) => completedTours[tourId] || false,
  };
}
