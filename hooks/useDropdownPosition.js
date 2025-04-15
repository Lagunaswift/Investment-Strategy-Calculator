import { useState, useEffect, useCallback } from 'react';
import { useLayoutEffect } from 'react';

export const useDropdownPosition = (triggerRef, contentRef, isMobile) => {
    const [position, setPosition] = useState({
        left: 0,
        top: 0,
        width: 0
    });

    const updatePosition = useCallback(() => {
        if (triggerRef.current && contentRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const contentRect = contentRef.current.getBoundingClientRect();

            // Calculate available space below the trigger
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;

            // Determine if we should show dropdown above or below
            const shouldShowAbove = spaceBelow < contentRect.height && spaceAbove > contentRect.height;

            const newPosition = {
                left: triggerRect.left,
                top: shouldShowAbove ? 
                    triggerRect.top - contentRect.height - 8 : 
                    triggerRect.bottom + 8,
                width: triggerRect.width
            };

            setPosition(newPosition);
        }
    }, [triggerRef, contentRef]);

    // Update position on layout changes
    useLayoutEffect(() => {
        updatePosition();
        const resizeObserver = new ResizeObserver(updatePosition);
        
        if (triggerRef.current) {
            resizeObserver.observe(triggerRef.current);
        }
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        return () => {
            if (triggerRef.current) {
                resizeObserver.unobserve(triggerRef.current);
            }
            if (contentRef.current) {
                resizeObserver.unobserve(contentRef.current);
            }
        };
    }, [updatePosition, triggerRef, contentRef]);

    // Update position on window resize
    useEffect(() => {
        const handleResize = () => updatePosition();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updatePosition]);

    return {
        position,
        updatePosition
    };
};
