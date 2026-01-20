'use client';

import { HTMLAttributes, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib';
import BrowseIcon from '../../../../public/icons/page-text-search.svg'
import FolderPaperIcon from '../../../../public/icons/folder-paper.svg'
import MessagesIcon from '../../../../public/icons/bubble.svg'
import SibylIcon from '../../../../public/icons/Sibyl.svg'
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
          ? 'bg-light'
          : 'hover:bg-active hover:text-text-primary'
      )}
    >
      <div className={cn('shrink-0', isActive ? 'text-text-primary' : 'text-text-sub group-hover:text-text-primary')}>
        <Image src={icon as StaticImport} alt={label} className="w-5 h-5" />
      </div>
      <span className={`font-medium ${isActive ? 'text-strong950' : 'text-sub600'}`}>{label}</span>
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
    <aside className="bg-transparent border-active flex flex-col h-full">
      <div className="p-4">
       <Image src={SibylIcon} alt="Legal Case Management" width={47} height={23} />
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
    </aside>
  );
}