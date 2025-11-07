'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

interface RecommendationSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function RecommendationSection({
  title,
  subtitle,
  viewAllLink,
  children,
  icon
}: RecommendationSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {icon && <div className="text-purple-600">{icon}</div>}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            View all
            <FiChevronRight />
          </Link>
        )}
      </div>
      
      {children}
    </section>
  );
}

