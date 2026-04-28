import { useContext } from 'react';
import { POSContext } from '@/hooks/posContext';

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
