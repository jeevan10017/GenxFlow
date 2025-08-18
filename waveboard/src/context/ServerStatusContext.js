import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const ServerStatusContext = createContext();

export const useServerStatus = () => useContext(ServerStatusContext);

export const ServerStatusProvider = ({ children }) => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [countdown, setCountdown] = useState(40);
  const wakeupPromiseRef = useRef(null);
  const intervalRef = useRef(null);

  const startWakeupProcess = useCallback(() => {
    if (wakeupPromiseRef.current) {
      return wakeupPromiseRef.current;
    }

    setIsWakingUp(true);
    setCountdown(40);

    // Create a new promise that will resolve when the countdown is finished
    const newWakeupPromise = new Promise((resolve) => {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsWakingUp(false);
            wakeupPromiseRef.current = null; // Reset the promise ref
            resolve(); // Resolve the promise
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    wakeupPromiseRef.current = newWakeupPromise;
    return newWakeupPromise;
  }, []);

  const value = { isWakingUp, countdown, startWakeupProcess };

  return (
    <ServerStatusContext.Provider value={value}>
      {children}
    </ServerStatusContext.Provider>
  );
};