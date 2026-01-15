'use client';

import { ReactNode } from 'react';

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function Header({ title, actions, children }: HeaderProps) {
  return (
    <header className="bg-white border-b border-legal-active px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {title && (
            <h2 className="text-lg font-semibold text-legal-text-primary">
              {title}
            </h2>
          )}
          {children}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search cases, clients..."
              className="w-80 pl-10 pr-4 py-2 bg-legal-bg border border-legal-active rounded-lg text-sm placeholder:text-legal-text-sub focus:outline-none focus:ring-2 focus:ring-legal-primary focus:border-transparent"
            />
            <svg
              className="w-4 h-4 text-legal-text-sub absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-legal-text-sub hover:text-legal-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-3-3V5a2 2 0 00-4 0v9l-3 3h5m6 0v1a3 3 0 11-6 0v-1m6 0V9a3 3 0 00-6 0v8z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-legal-primary text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </button>
          
          {/* Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}