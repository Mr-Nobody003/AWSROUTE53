'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Handle specific shortcuts
      switch (e.key.toLowerCase()) {
        case 'h': // Go to Hosted Zones
          router.push('/hosted-zones');
          break;
        case 'd': // Go to Dashboard
          router.push('/');
          break;
        case 'n': // Create new resource (if available on the page)
          const createBtn = document.getElementById('create-resource-btn');
          if (createBtn) {
            e.preventDefault();
            createBtn.click();
          }
          break;
        case '/': // Focus search
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            e.preventDefault();
            searchInput.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
