import { useEffect, useState } from 'react';

export const useUserActivity = () => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleUserActivity = () => {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 60000); // Inactive after 1 minute of no activity
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  return isActive;
};
