'use client';

import { ToastProvider } from './Toast';
import SessionTimeout from './SessionTimeout';

export function Providers({ children }) {
  return (
    <ToastProvider>
      {children}
      <SessionTimeout />
    </ToastProvider>
  );
}
