import { useState, useCallback } from "react";

/**
 * useOptimistic - handles optimistic UI updates with automatic rollback on error.
 * @param {*} initialValue - the current "real" value
 * @returns [optimisticValue, runOptimistic]
 *   runOptimistic(nextValue, asyncFn) — applies nextValue immediately,
 *   runs asyncFn(), rolls back to initialValue if it throws.
 */
export function useOptimistic(initialValue) {
  const [optimisticValue, setOptimisticValue] = useState(initialValue);

  const runOptimistic = useCallback(
    async (nextValue, asyncFn) => {
      setOptimisticValue(nextValue);
      try {
        await asyncFn();
      } catch (err) {
        setOptimisticValue(initialValue);
        throw err;
      }
    },
    [initialValue]
  );

  // Sync if real value changes externally
  const setValue = setOptimisticValue;

  return [optimisticValue, runOptimistic, setValue];
}