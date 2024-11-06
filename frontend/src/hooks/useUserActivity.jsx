import { useEffect, useState, useRef } from 'react';

export const useUserActivity = () => {
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimeout = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsActive(true);

      // Set timeout to mark inactive after 2 minutes of no activity
      timerRef.current = setTimeout(() => setIsActive(false), 120000);
    };

    // Reset timeout on various user activity events
    const handleUserActivity = () => resetTimeout();

    // Event listeners for various user interactions
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    // Set initial timeout
    resetTimeout();

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return isActive;
};
