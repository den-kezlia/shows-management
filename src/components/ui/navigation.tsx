"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

interface AdminNavProps {
  adminUser?: { username: string; email: string } | null;
  onLogout?: () => void;
}

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/admin/shows", label: "Shows", icon: "🎞️" },
  { href: "/admin/performances", label: "Performances", icon: "🎪" },
  { href: "/admin/tickets", label: "Tickets", icon: "🎫" },
];

export function AdminNav({ adminUser, onLogout }: AdminNavProps) {
  const pathname = usePathname();

  return (
  <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">🎭 Tickets Agent</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {adminNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {adminUser && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium">{adminUser.username}</span>
                </span>
              </div>
            )}
            <Link href="/scanner">
              <Button variant="outline" size="sm">
                📱 Scanner
              </Button>
            </Link>
            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PublicNav() {
  return (
  <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">🎭 Tickets Agent</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/scanner">
              <Button variant="outline" size="sm">
                📱 Scanner
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
