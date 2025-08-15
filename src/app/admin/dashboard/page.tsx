"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/spinner";
import { AdminNav } from "@/components/ui/navigation";
import { Performance, Ticket, Show } from "@/types";

export default function AdminDashboard() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");
    
    if (!token || !user) {
      router.push("/admin");
      return;
    }

    // Verify token is still valid
    fetch("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setAdminUser(JSON.parse(user));
          loadDashboardData();
        } else {
          // Token is invalid, redirect to login
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          router.push("/admin");
        }
      })
      .catch(() => {
        // Error verifying token, redirect to login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        router.push("/admin");
      });
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const [showsRes, performancesRes, ticketsRes] = await Promise.all([
        fetch("/api/shows"),
        fetch("/api/performances"),
        fetch("/api/tickets"),
      ]);

      const showsData = await showsRes.json();
      const performancesData = await performancesRes.json();
      const ticketsData = await ticketsRes.json();

      if (showsData.success) {
        setShows(showsData.data);
      }
      if (performancesData.success) {
        setPerformances(performancesData.data);
      }
      if (ticketsData.success) {
        setTickets(ticketsData.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
  setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin");
  };

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  // Compute summaries now that data is loaded
  const totalShows = shows.length;
  const latestShowNames = shows.slice(0, 3).map((s: Show) => s.name);
  const totalPerformances = performances.length;
  const latestPerformances = [...performances]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return bTime - aTime;
    })
    .slice(0, 3)
    .map((p) => p.name);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav adminUser={adminUser} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-10">
          {/* Shows */}
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-rose-200 rounded-xl shadow-md">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-rose-800 text-2xl sm:text-3xl">
                🎞️ Shows
              </CardTitle>
              <CardDescription className="text-base">Group and manage shows</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-8">
              <div className="text-sm text-muted-foreground mb-2">Total: {totalShows}</div>
              {latestShowNames.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-foreground mb-1">Latest</div>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {latestShowNames.map((name, idx) => (
                      <li key={`${name}-${idx}`}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href="/admin/shows">
                <Button size="lg" className="w-full bg-rose-600 hover:bg-rose-700">
                  Manage Shows
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performances */}
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-blue-200 rounded-xl shadow-md">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-blue-800 text-2xl sm:text-3xl">
                🎪 Performances
              </CardTitle>
              <CardDescription className="text-base">Create and manage theater performances</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-8">
              <div className="text-sm text-muted-foreground mb-2">Total: {totalPerformances}</div>
              {latestPerformances.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-foreground mb-1">Latest</div>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {latestPerformances.map((name, idx) => (
                      <li key={`${name}-${idx}`}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href="/admin/performances">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage Performances
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-green-200 rounded-xl shadow-md">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-green-800 text-2xl sm:text-3xl">
                🎫 Tickets
              </CardTitle>
              <CardDescription className="text-base">Create tickets and track sales</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-8">
              <Link href="/admin/tickets">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  Manage Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Scanner */}
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-purple-200 rounded-xl shadow-md">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-purple-800 text-2xl sm:text-3xl">
                📱 QR Scanner
              </CardTitle>
              <CardDescription className="text-base">Validate tickets at venue entrance</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-8">
              <Link href="/scanner">
                <Button size="lg" variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  Open Scanner
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
