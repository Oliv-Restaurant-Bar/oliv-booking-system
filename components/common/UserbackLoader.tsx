'use client';

import { useEffect } from 'react';
import Userback from '@userback/widget';

export default function UserbackLoader() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_USERBACK_ACCESS_TOKEN;
    if (token) {
      Userback(token)
        .then((userback) => {
          // Initialize logic here
        })
        .catch((error) => {
          console.warn('Userback failed to load:', error);
          // We catch this to prevent Next.js from showing a runtime error [object Event]
          // which happens when the external script fails to load (e.g. domain not whitelisted)
        });
    }
  }, []);

  return null;
}
