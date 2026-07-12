import { useState, useEffect } from 'react';

export function useMinimumLoading(isLoading: boolean, minimumTimeMs: number = 800) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      setShowLoading(true);
    } else {
      // Data has loaded, wait for the minimum time before hiding skeleton
      timeoutId = setTimeout(() => {
        setShowLoading(false);
      }, minimumTimeMs);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading, minimumTimeMs]);

  // Initially show loading, and enforce at least minimumTimeMs
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      if (!isLoading) {
        setShowLoading(false);
      }
    }, minimumTimeMs);
    return () => clearTimeout(initialTimeout);
  }, []); // Only run once on mount

  return showLoading;
}
