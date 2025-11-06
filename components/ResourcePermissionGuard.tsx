'use client';

import { ReactNode } from 'react';
import { usePermissions, PermissionAction } from '@/lib/usePermissions';
import { FiEdit, FiTrash2, FiEye, FiLock } from 'react-icons/fi';

interface ResourcePermissionGuardProps {
  children: ReactNode;
  resource: string;
  action: PermissionAction;
  data: any;
  fallback?: ReactNode;
  showPlaceholder?: boolean;
}

/**
 * Guards a component based on resource-specific permissions
 * Checks if user can perform an action on a specific resource instance
 * 
 * Example:
 * <ResourcePermissionGuard resource="album" action="update" data={album}>
 *   <EditAlbumButton />
 * </ResourcePermissionGuard>
 */
export function ResourcePermissionGuard({
  children,
  resource,
  action,
  data,
  fallback,
  showPlaceholder = false
}: ResourcePermissionGuardProps) {
  const { can, loading } = usePermissions();

  if (loading) {
    return showPlaceholder ? <PermissionPlaceholder action={action} /> : null;
  }

  if (!can(action, resource, data)) {
    return fallback || (showPlaceholder ? <PermissionPlaceholder action={action} disabled /> : null);
  }

  return <>{children}</>;
}

/**
 * Shows inline button/action based on resource permission
 * Automatically hides if user doesn't have permission
 */
interface ConditionalActionProps {
  resource: string;
  action: PermissionAction;
  data: any;
  children: ReactNode;
  hideIfNoAccess?: boolean;
}

export function ConditionalAction({
  resource,
  action,
  data,
  children,
  hideIfNoAccess = true
}: ConditionalActionProps) {
  const { can } = usePermissions();

  if (!can(action, resource, data)) {
    return hideIfNoAccess ? null : (
      <div className="opacity-50 cursor-not-allowed" title="You don't have permission">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Ownership badge component
 */
interface OwnershipBadgeProps {
  resource: string;
  data: any;
  showIfOwner?: boolean;
  showIfNotOwner?: boolean;
}

export function OwnershipBadge({
  resource,
  data,
  showIfOwner = true,
  showIfNotOwner = false
}: OwnershipBadgeProps) {
  const { owns, isAdmin } = usePermissions();
  const isOwner = owns(resource, data);

  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-900/30 border border-purple-700/50 text-purple-300 text-xs font-medium">
        <FiLock className="w-3 h-3" />
        Admin
      </span>
    );
  }

  if (isOwner && showIfOwner) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-900/30 border border-blue-700/50 text-blue-300 text-xs font-medium">
        <FiEye className="w-3 h-3" />
        Owner
      </span>
    );
  }

  if (!isOwner && showIfNotOwner) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800/30 border border-gray-700/50 text-gray-400 text-xs font-medium">
        View Only
      </span>
    );
  }

  return null;
}

function PermissionPlaceholder({ action, disabled = false }: { action: PermissionAction; disabled?: boolean }) {
  const getIcon = () => {
    switch (action) {
      case 'update': return <FiEdit className="w-4 h-4" />;
      case 'destroy': return <FiTrash2 className="w-4 h-4" />;
      default: return <FiLock className="w-4 h-4" />;
    }
  };

  if (disabled) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/30 border border-gray-700/50 text-gray-500 text-sm opacity-50 cursor-not-allowed">
        {getIcon()}
        No Access
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 animate-pulse">
      <div className="w-4 h-4 bg-gray-700 rounded" />
      <div className="w-16 h-4 bg-gray-700 rounded" />
    </div>
  );
}

