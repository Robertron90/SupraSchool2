import { useCallback } from 'react';
export function useBackHome(history) {
  const backToHome = useCallback(() => {
    history.goBack();
  }, [history]);
  return backToHome;
}
