import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  email: string;
}

interface UseAuthResult {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useAuth(): UseAuthResult {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const user = localStorage.getItem("adminUser");
      
      if (!token || !user) {
        setIsLoading(false);
        return;
      }

      // Verify token is still valid
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const userData = JSON.parse(user);
        setAdminUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminUser(null);
    setIsAuthenticated(false);
    router.push("/admin");
  };

  return {
    adminUser,
    isLoading,
    isAuthenticated,
    logout,
  };
}

export function useProtectedRoute(): UseAuthResult {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push("/admin");
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}
