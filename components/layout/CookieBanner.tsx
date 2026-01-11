'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="bg-secondary-900 text-white rounded-2xl shadow-2xl p-6 md:flex md:items-center md:justify-between gap-6">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-secondary-200 leading-relaxed">
              We use cookies to improve your experience and analyze site traffic. 
              By continuing, you agree to our{' '}
              <Link href="/cookie-policy" className="underline hover:text-white">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-5 py-2.5 text-sm font-medium text-secondary-300 hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-full hover:bg-primary-500 transition-colors"
            >
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
