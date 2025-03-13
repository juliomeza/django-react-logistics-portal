import { useState, useRef, useCallback } from 'react';

// Hook para gestionar el scroll de la tabla
const useTableScroll = () => {
  const tableContainerRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  // Handle horizontal scroll - usar useCallback para estabilizar la función
  const handleScroll = useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setShowLeftShadow(scrollLeft > 5);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  // Scroll left/right by one visible width
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return {
    tableContainerRef,
    showLeftShadow,
    showRightShadow,
    handleScroll,
    scrollLeft,
    scrollRight
  };
};

export default useTableScroll;