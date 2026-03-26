import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function PageNotFound() {
  useEffect(() => {
    base44.auth.redirectToLogin();
  }, []);

  return null;
}