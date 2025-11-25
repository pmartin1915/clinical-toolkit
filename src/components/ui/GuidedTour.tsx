import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, MapPin, Sparkles } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Clinical Wizard!',
    description: 'Let me show you around! This quick tour will help you discover all the helpful features.',
    target: 'body',
    position: 'bottom'
  },
  {
    id: 'quick-tools',
    title: 'Quick Health Tools',
    description: 'These colorful buttons give you instant access to popular health calculators and assessments. Perfect for quick checks!',
    target: '[data-tour="quick-tools"]',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'search',
    title: 'Find What You Need',
    description: 'Use the search bar to quickly find any condition or tool. Try typing "diabetes" or "anxiety"!',
    target: '[data-tour="search"]',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'condition-cards',
    title: 'Explore Conditions',
    description: 'Each card shows a health condition with easy-to-understand information and helpful tools. Click "Try tools" to get started!',
    target: '[data-tour="condition-card"]:first-child',
    position: 'top',
    highlight: true
  },
  {
    id: 'accessibility',
    title: 'Make It Yours',
    description: 'Need larger text or better contrast? Click this settings button (bottom right) to customize the app for your needs.',
    target: '[data-tour="accessibility"]',
    position: 'left',
    highlight: true
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'That\'s it! Remember, this tool works offline and you can install it on your computer or phone. Happy exploring!',
    target: 'body',
    position: 'bottom'
  }
];

export const GuidedTour = ({ isOpen, onClose, onComplete }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialWindowPos, setInitialWindowPos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement;
    
    if (targetElement && step.highlight) {
      setHighlightedElement(targetElement);
      const originalPosition = targetElement.style.position;
      const originalZIndex = targetElement.style.zIndex;
      const computedStyle = window.getComputedStyle(targetElement);
      
      // Enhanced spotlight effect - make it glow and stand out
      // Preserve fixed positioning for fixed elements like the accessibility button
      if (computedStyle.position !== 'fixed') {
        targetElement.style.position = originalPosition || 'relative';
      }
      targetElement.style.zIndex = '9997';
      targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.12)';
      targetElement.style.borderRadius = '12px';
      targetElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      targetElement.style.transform = 'scale(1.05)';
      targetElement.style.boxShadow = `
        0 0 0 3px rgba(59, 130, 246, 0.4),
        0 0 20px rgba(59, 130, 246, 0.3),
        0 15px 35px -5px rgba(59, 130, 246, 0.25),
        0 25px 65px -15px rgba(59, 130, 246, 0.15)
      `;
      targetElement.style.filter = 'brightness(1.15) saturate(1.2) contrast(1.05)';
      
      // Set transform origin based on element position to prevent shifting
      const rect = targetElement.getBoundingClientRect();
      const isBottomRight = rect.right > window.innerWidth * 0.8 && rect.bottom > window.innerHeight * 0.8;
      targetElement.style.transformOrigin = isBottomRight ? 'bottom right' : 'center';
      
      // Add a subtle pulsing animation
      targetElement.style.animation = 'tour-highlight-pulse 2s ease-in-out infinite';
      
      // Store original values for cleanup
      targetElement.dataset.originalPosition = originalPosition || '';
      targetElement.dataset.originalZIndex = originalZIndex || '';
      
      // Spotlight overlay removed - target element highlighting is sufficient
      
      // Scroll element into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
        highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
        highlightedElement.style.backgroundColor = '';
        highlightedElement.style.borderRadius = '';
        highlightedElement.style.transform = '';
        highlightedElement.style.boxShadow = '';
        highlightedElement.style.filter = '';
        highlightedElement.style.animation = '';
        highlightedElement.style.transformOrigin = '';
        highlightedElement.style.transition = '';
        delete highlightedElement.dataset.originalPosition;
        delete highlightedElement.dataset.originalZIndex;
      }
      // removeSpotlightOverlay(); // No longer needed
    };
  }, [currentStep, isOpen, highlightedElement]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setInitialWindowPos({ x: rect.left, y: rect.top });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;

    let newX = initialWindowPos.x + deltaX;
    let newY = initialWindowPos.y + deltaY;

    // Ensure the modal stays within viewport boundaries
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      newX = Math.max(0, Math.min(window.innerWidth - rect.width, newX));
      newY = Math.max(0, Math.min(window.innerHeight - rect.height, newY));
    }

    setPosition({
      x: newX,
      y: newY
    });
  }, [isDragging, initialMousePos, initialWindowPos]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, initialMousePos, initialWindowPos, handleMouseMove]);



  const completeTour = () => {
    if (highlightedElement) {
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      highlightedElement.style.backgroundColor = '';
      highlightedElement.style.borderRadius = '';
      highlightedElement.style.transform = '';
      highlightedElement.style.boxShadow = '';
      highlightedElement.style.filter = '';
      highlightedElement.style.animation = '';
      highlightedElement.style.transformOrigin = '';
      highlightedElement.style.transition = '';
      delete highlightedElement.dataset.originalPosition;
      delete highlightedElement.dataset.originalZIndex;
    }
    // removeSpotlightOverlay(); // No longer needed
    onComplete();
    onClose();
  };

  const skipTour = () => {
    if (highlightedElement) {
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      highlightedElement.style.backgroundColor = '';
      highlightedElement.style.borderRadius = '';
      highlightedElement.style.transform = '';
      highlightedElement.style.boxShadow = '';
      highlightedElement.style.filter = '';
      highlightedElement.style.animation = '';
      highlightedElement.style.transformOrigin = '';
      highlightedElement.style.transition = '';
      delete highlightedElement.dataset.originalPosition;
      delete highlightedElement.dataset.originalZIndex;
    }
    // removeSpotlightOverlay(); // No longer needed
    onClose();
  };

  const resetWindowPosition = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Simple backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-[9996]" 
        onClick={skipTour}
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-sm w-full"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`
        }}
      >
        {/* Emergency reset handle - double click to reset position */}
        <div 
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-300 rounded-t cursor-ns-resize hover:bg-blue-400 transition-colors"
          onDoubleClick={resetWindowPosition}
          title="Double-click to reset window position"
        />
        
        {/* Header - Draggable area */}
        <div 
          className="flex items-center justify-between mb-4 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="p-3 min-h-touch-md min-w-touch-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            aria-label="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-touch-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-touch-md"
            title={currentStep === tourSteps.length - 1 ? 'Finish tour' : 'Next step'}
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
            {currentStep === tourSteps.length - 1 ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Skip Option */}
        <div className="mt-4 text-center">
          <button
            onClick={skipTour}
            className="px-4 py-3 min-h-touch-md text-sm text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
            aria-label="Skip guided tour"
          >
            Skip tour
          </button>
        </div>
      </div>
    </>
  );
};
