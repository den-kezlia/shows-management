"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

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
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
      setMobileOpen(false);
    }, [pathname]);

    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                type="button"
                aria-label="Toggle navigation"
                className="md:hidden inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 text-sm"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
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
              <Link href="/scanner" className="hidden md:inline-block">
                <Button variant="outline" size="sm">
                  📱 Scanner
                </Button>
              </Link>
              {onLogout && (
                <Button variant="outline" size="sm" onClick={onLogout} className="hidden md:inline-flex">
                  Logout
                </Button>
              )}
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden border-t border-border py-2 space-y-1">
              <div className="grid gap-1">
                {adminNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="w-full">
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Link href="/scanner" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">📱 Scanner</Button>
                </Link>
                {onLogout && (
                  <Button variant="outline" size="sm" onClick={onLogout} className="flex-1">Logout</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

export function PublicNav({ showScannerLink = true }: { showScannerLink?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              aria-label="Toggle navigation"
              className="md:hidden inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 text-sm"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">🎭 Tickets Agent</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {showScannerLink && (
              <Link href="/scanner">
                <Button variant="outline" size="sm">
                  📱 Scanner
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button size="sm">Admin</Button>
            </Link>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-2 space-y-1">
            <div className="grid gap-2">
              {showScannerLink && (
                <Link href="/scanner" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-start">📱 Scanner</Button>
                </Link>
              )}
              <Link href="/" className="w-full">
                <Button size="sm" className="w-full justify-start">Admin</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
