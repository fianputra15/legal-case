"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import SearchIcon from "../../../../public/icons/search.svg";
import BellIcon from "../../../../public/icons/bell.svg";
import Image from "next/image";
import { useAuth } from "@/shared/lib/auth";
import { apiClient, ApiError } from "@/shared/api";
import { ApiResponse, CasesListResponse, SearchResult } from "@/shared/types";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
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

  // Search function with API integration
  const searchCases = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("search", query.trim());
      params.append("limit", "8"); // Limit results for dropdown
      params.append("page", "1");

      const response = await apiClient.get<ApiResponse<CasesListResponse>>(`/api/cases?${params.toString()}`);
      
      if (response.data?.cases) {
        const mappedResults: SearchResult[] = response.data.cases.map((caseItem) => ({
          id: caseItem.id,
          title: caseItem.title,
          category: caseItem.category,
          status: caseItem.status,
          priority: caseItem.priority,
          clientName: caseItem.clientName || caseItem.client?.firstName || 'Unknown Client'
        }));
        setSearchResults(mappedResults);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      if (err instanceof ApiError) {
        console.error(`Search API error: ${err.message}`);
      }
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search API calls
    searchTimeoutRef.current = setTimeout(() => {
      searchCases(query);
    }, 300); // 300ms delay
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // Trigger search if there's already a query
    if (searchQuery.trim()) {
      searchCases(searchQuery);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    // Navigate to case detail page
    window.location.href = `/case/${result.id}`;
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
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
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  placeholder="Search cases"
                  className="text-soft400 w-80 pl-10 pr-4 py-2 bg-weak border border-light rounded-lg text-sm placeholder:text-soft400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Image
                  src={SearchIcon}
                  alt="Search"
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                
                {/* Search Results Dropdown */}
                {isSearchFocused && (searchResults.length > 0 || isSearchLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {isSearchLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Searching...
                        </div>
                      </div>
                    ) : (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSearchSelect(result)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-sm text-gray-900">{result.title}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className="capitalize">{result.category.toLowerCase().replace('_', ' ')}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
                
                {/* No Results Message */}
                {isSearchFocused && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No results found for {searchQuery}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-0.5 h-5 bg-light" />
            </>
          )}

          {showProfile && (
            <>
              {/* Notifications */}
              <button className="relative p-2 text-sub hover:text-text-primary transition-colors">
                <Image src={BellIcon} fill  alt="Notifications"  />
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
