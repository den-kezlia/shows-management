import { ReactNode } from 'react';
import { useProtectedRoute } from '@/lib/useAuth';
import { LoadingScreen } from '@/components/ui/spinner';

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { isLoading, isAuthenticated } = useProtectedRoute();

  if (isLoading) {
    return fallback || <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return null; // The useProtectedRoute hook handles the redirect
  }

  return <>{children}</>;
}
