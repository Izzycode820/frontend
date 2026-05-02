'use client';

/**
 * MobileToolsSheet
 * Mobile slide-in panel (right-to-left) for the Strategy + Catalog sidebar.
 * Wraps InboxRightSidebar with a backdrop and slide animation.
 * Design this file independently for mobile tools-panel UI improvements.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { InboxRightSidebar, type SidebarTab, type InboxRightSidebarProps } from '../InboxRightSidebar';

export interface MobileToolsSheetProps
  extends Omit<InboxRightSidebarProps, 'onClose'> {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileToolsSheet({ isOpen, onClose, ...sidebarProps }: MobileToolsSheetProps) {
  // Lock body scroll when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'absolute inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-label="Tools panel"
        className={cn(
          'absolute top-0 right-0 bottom-0 z-50 w-[88vw] max-w-[380px] shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <InboxRightSidebar {...sidebarProps} onClose={onClose} />
      </div>
    </>
  );
}
