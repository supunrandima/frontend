import { useEffect, useRef } from 'react';

const useIdleTimeout = (onIdle, idleTime = 10000) => {
  const timeoutId = useRef(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      onIdle();
    }, idleTime);
  };

  useEffect(() => {
    // Start the timer initially
    resetTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    
    // Attach event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup function
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [onIdle, idleTime]);
};

export default useIdleTimeout;
