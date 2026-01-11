'use client';

import React from 'react';

interface AdPlaceholderProps {
  type?: 'inline' | 'sidebar' | 'banner' | 'native';
  className?: string;
}

/**
 * Ad placeholder component with fixed heights to prevent CLS (Cumulative Layout Shift).
 * These placeholders will be replaced with actual ad code when ad networks are integrated.
 * 
 * Types:
 * - inline: In-article ads (300x250 or responsive)
 * - sidebar: Sidebar sticky ads (300x600)
 * - banner: Leaderboard/header ads (728x90)
 * - native: Native/content recommendation style
 */
export default function AdPlaceholder({ type = 'inline', className = '' }: AdPlaceholderProps) {
  const getStyles = () => {
    switch (type) {
      case 'sidebar':
        return 'min-h-[600px] max-w-[300px]';
      case 'banner':
        return 'min-h-[90px] max-w-[728px] mx-auto';
      case 'native':
        return 'min-h-[150px]';
      case 'inline':
      default:
        return 'min-h-[250px] max-w-[336px] mx-auto';
    }
  };

  return (
    <div 
      className={`
        ${getStyles()}
        bg-secondary-50 
        rounded-lg 
        flex 
        items-center 
        justify-center 
        my-8
        ${className}
      `}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="text-center p-4">
        <p className="text-xs text-secondary-400 uppercase tracking-wider">
          Advertisement
        </p>
        {/* Ad code will be inserted here */}
      </div>
    </div>
  );
}

/**
 * Inline ad component for use within article content
 */
export function InlineAd({ position }: { position: 'after-intro' | 'mid-content' | 'end-content' }) {
  return (
    <div className="my-8 py-2">
      <AdPlaceholder 
        type="inline" 
        className={`ad-position-${position}`}
      />
    </div>
  );
}

/**
 * Sidebar ad component for sticky sidebar placement
 */
export function SidebarAd() {
  return (
    <div className="sticky top-24">
      <AdPlaceholder type="sidebar" />
    </div>
  );
}

/**
 * Banner ad for header/footer placement
 */
export function BannerAd() {
  return (
    <div className="w-full py-4 bg-secondary-50">
      <AdPlaceholder type="banner" />
    </div>
  );
}
