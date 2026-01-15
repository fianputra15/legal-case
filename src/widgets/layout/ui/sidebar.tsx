'use client';

import { HTMLAttributes, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib';
import BrowseIcon from '../../../../public/icons/page-text-search.svg'
import FolderPaperIcon from '../../../../public/icons/folder-paper.svg'
import MessagesIcon from '../../../../public/icons/bubble.svg'
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface SidebarProps {
  children?: ReactNode;
}

interface NavItemProps extends LinkProps<object>, HTMLAttributes<HTMLAnchorElement>{

  icon: StaticImport | ReactNode;
  label: string;
  badge?: string | number;
}

function NavItem({ href, icon, label, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group',
        isActive
          ? 'bg-active text-text-primary'
          : 'text-text-sub hover:bg-active hover:text-text-primary'
      )}
    >
      <div className={cn('shrink-0', isActive ? 'text-text-primary' : 'text-text-sub group-hover:text-text-primary')}>
        <Image src={icon as StaticImport} alt={label} className="w-5 h-5" />
      </div>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto px-2 py-1 text-xs bg-text-badge/10 text-text-badge rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-64 bg-brand border-r border-active flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-text-primary">
          Legal Workspace
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <NavItem
          href="/"
          icon={
          BrowseIcon
          }
          label="Browse Cases"
        />
        
        <NavItem
          href="/my-cases"
          icon={
           FolderPaperIcon
          }
          label="My Cases"
          badge="12"
        />
        
        <NavItem
          href="/messages"
          icon={
            MessagesIcon
          }
          label="Messages"
          badge="3"
        />
        
        {/* Additional navigation items from children */}
        {children}
      </nav>
      
      <div className="p-4 border-t border-active">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-weak">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              John Doe
            </p>
            <p className="text-xs text-text-sub truncate">
              Senior Lawyer
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}