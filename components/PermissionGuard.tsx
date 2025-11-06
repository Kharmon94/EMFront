'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/usePermissions';
import { FiLock, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface PermissionGuardProps {
  children: ReactNode;
  require?: 'auth' | 'admin' | 'artist' | 'wallet';
  permission?: string;
  fallback?: ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

export function PermissionGuard({ 
  children, 
  require,
  permission,
  fallback,
  redirectTo,
  showMessage = true
}: PermissionGuardProps) {
  const router = useRouter();
  const perms = usePermissions();

  if (perms.loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check specific permission
  if (permission && !perms.hasPermission(permission)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return fallback || <PermissionDenied message="You don't have permission to access this feature" />;
  }

  // Check role-based requirements
  let hasAccess = true;
  let message = 'Access denied';

  switch (require) {
    case 'auth':
      hasAccess = perms.isAuthenticated;
      message = 'Please sign in to continue';
      break;
    case 'admin':
      hasAccess = perms.canAccessAdmin;
      message = 'Admin access required';
      break;
    case 'artist':
      hasAccess = perms.canAccessArtistDashboard;
      message = 'Artist account required';
      break;
    case 'wallet':
      hasAccess = perms.user?.has_wallet_auth || false;
      message = 'Wallet connection required';
      break;
  }

  if (!hasAccess) {
    if (showMessage) {
      toast.error(message);
    }
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return fallback || <PermissionDenied message={message} />;
  }

  return <>{children}</>;
}

function PermissionDenied({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-900/20 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <FiLock className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">{message}</p>
    </div>
  );
}

// Action Guard for inline permission checks
interface ActionGuardProps {
  children: ReactNode;
  action: string;
  showAuthPrompt?: boolean;
  showWalletPrompt?: boolean;
  fallback?: ReactNode;
}

export function ActionGuard({ 
  children, 
  action, 
  showAuthPrompt = false,
  showWalletPrompt = false,
  fallback 
}: ActionGuardProps) {
  const perms = usePermissions();

  if (perms.requiresAuth(action)) {
    if (showAuthPrompt) {
      return fallback || (
        <div className="text-center p-4">
          <FiAlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to {action}</p>
        </div>
      );
    }
    return null;
  }

  if (perms.requiresWallet(action)) {
    if (showWalletPrompt) {
      return fallback || (
        <div className="text-center p-4">
          <FiAlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Connect wallet to {action}</p>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}

