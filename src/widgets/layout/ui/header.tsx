"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import SearchIcon from "../../../../public/icons/search.svg";
import BellIcon from "../../../../public/icons/bell.svg";
import Image from "next/image";
import { useAuth } from "@/shared/lib/auth";

interface HeaderProps {
  title?: ReactNode | string;
  actions?: ReactNode;
  children?: ReactNode;
  showSearchBar?: boolean;
  showProfile?: boolean;
}

export default function Header({
  title,
  actions,
  children,
  showSearchBar = true,
  showProfile = true,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <header className="bg-white border-b border-light px-4 py-4">
      <div className="flex items-center">
        <div className="w-full flex items-center gap-4">
          {title && (
            <div className="text-lg font-semibold text-dark w-full">{title}</div>
          )}
          {children}
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          {showSearchBar && (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cases, clients..."
                  className="text-soft400 w-80 pl-10 pr-4 py-2 bg-weak border border-light rounded-lg text-sm placeholder:text-soft400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Image
                  src={SearchIcon}
                  alt="Search"
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                />
              </div>
              <div className="w-0.5 h-5 bg-light" />
            </>
          )}

          {showProfile && (
            <>
              {/* Notifications */}
              <button className="relative p-2 text-text-sub hover:text-text-primary transition-colors">
                <Image src={BellIcon} alt="Notifications" width={20} height={20} />
              </button>
              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 bg-biege rounded-full hover:bg-gray-200 transition-colors"
                >
                  <span className="text-xs font-medium text-strong900">
                    {user?.firstName
                      ? user.firstName.slice(0, 2).toUpperCase()
                      : "UN"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
