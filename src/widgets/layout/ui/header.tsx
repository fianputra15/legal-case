'use client';

import { ReactNode } from 'react';
import SearchIcon from '../../../../public/icons/search.svg'
import BellIcon from '../../../../public/icons/bell.svg'
import Image from 'next/image';
import { useAuth } from '@/shared/lib/auth-context';

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function Header({ title, actions, children }: HeaderProps) {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-light px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {title && (
            <h2 className="text-lg font-semibold text-dark">
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
              className="text-soft400 w-80 pl-10 pr-4 py-2 bg-weak border border-light rounded-lg text-sm placeholder:text-soft400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Image src={SearchIcon} alt="Search" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className='w-0.5 h-5 bg-light'/>
          
          {/* Notifications */}
          <button className="relative p-2 text-text-sub hover:text-text-primary transition-colors">
            <Image src={BellIcon} alt="Notifications" className="w-6 h-6" />
          </button>
          {/* User Avatar */}
          <div className="flex items-center justify-center w-8 h-8 bg-biege rounded-full">
            <span className="text-xs font-medium text-strong900">
              {user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : 'UN'}
            </span>
          </div>
          {/* Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}