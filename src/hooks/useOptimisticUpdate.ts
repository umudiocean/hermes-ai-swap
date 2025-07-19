import { useState, useCallback } from 'react';

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error?: string;
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false
  });

  const updateOptimistic = useCallback((newData: T) => {
    setState({
      data: newData,
      isOptimistic: true
    });
  }, []);

  const confirmUpdate = useCallback((confirmedData: T) => {
    setState({
      data: confirmedData,
      isOptimistic: false
    });
  }, []);

  const revertUpdate = useCallback((error?: string) => {
    setState(prev => ({
      data: initialData,
      isOptimistic: false,
      error
    }));
  }, [initialData]);

  return {
    ...state,
    updateOptimistic,
    confirmUpdate,
    revertUpdate
  };
}

// Specialized for balance updates
export function useOptimisticBalance(initialBalance: string) {
  const { data: balance, updateOptimistic, confirmUpdate, revertUpdate, isOptimistic } = useOptimisticUpdate(initialBalance);

  const updateBalance = useCallback((newBalance: string, isOptimistic: boolean = true) => {
    if (isOptimistic) {
      updateOptimistic(newBalance);
    } else {
      confirmUpdate(newBalance);
    }
  }, [updateOptimistic, confirmUpdate]);

  return {
    balance,
    isOptimistic,
    updateBalance,
    revertBalance: revertUpdate
  };
}