'use client';

import Link from 'next/link';
import { FiChevronRight, FiHome } from 'react-icons/fi';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Home"
      >
        <FiHome className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <FiChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

