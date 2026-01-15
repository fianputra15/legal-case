'use client';

import { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';

interface MainLayoutProps {
  children: ReactNode;
  sidebarChildren?: ReactNode;
  headerTitle?: string;
  headerActions?: ReactNode;
}

export default function MainLayout({
  children,
  sidebarChildren,
  headerTitle,
  headerActions,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-legal-bg">
      <div className="flex">
        <Sidebar>{sidebarChildren}</Sidebar>
        
        <div className="flex-1 flex flex-col">
          <Header title={headerTitle} actions={headerActions} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}