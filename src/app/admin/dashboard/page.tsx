"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/ui/spinner";
import { AdminNav } from "@/components/ui/navigation";
import { Performance, Ticket } from "@/types";
import { formatDateUTC, formatTimeUTC } from "@/lib/utils";

export default function AdminDashboard() {
  const [performances, setPerformances] = useState<Performance[]>([]);
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
      const [performancesRes, ticketsRes] = await Promise.all([
        fetch("/api/performances"),
        fetch("/api/tickets"),
      ]);

      const performancesData = await performancesRes.json();
      const ticketsData = await ticketsRes.json();

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

  const totalTickets = tickets.length;
  const visitedTickets = tickets.filter(t => t.isVisited).length;
  const upcomingPerformances = performances.filter(p => new Date(p.date) > new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav adminUser={adminUser} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              🎭 Welcome back, {adminUser?.username}!
            </CardTitle>
            <CardDescription className="text-blue-100">
              Here&apos;s what&apos;s happening with your theater ticket system today
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span>🎪</span>
              <span>{performances.length} Performances</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span>🎫</span> 
              <span>{totalTickets} Tickets</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span>✅</span>
              <span>{visitedTickets} Validated</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Performances</CardTitle>
              <div className="h-8 w-8 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-lg">🎪</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{performances.length}</div>
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-xs">
                  {upcomingPerformances} upcoming
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Tickets</CardTitle>
              <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-lg">🎫</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{totalTickets}</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                  {visitedTickets} validated
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Validation Rate</CardTitle>
              <div className="h-8 w-8 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {totalTickets > 0 ? Math.round((visitedTickets / totalTickets) * 100) : 0}%
              </div>
              <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="bg-purple-200 text-purple-800 text-xs">
                  {visitedTickets}/{totalTickets} tickets
                </Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                🎪 Performances
              </CardTitle>
              <CardDescription className="text-sm">
                Create and manage theater performances
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/admin/performances">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage Performances
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                🎫 Tickets
              </CardTitle>
              <CardDescription className="text-sm">
                Create tickets and track sales
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/admin/tickets">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Manage Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                📱 QR Scanner
              </CardTitle>
              <CardDescription className="text-sm">
                Validate tickets at venue entrance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/scanner">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  Open Scanner
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                ⚡ Quick Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                📊 View Reports
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                📧 Send Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Performances */}
        {performances.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Recent Performances
              </CardTitle>
              <CardDescription>
                Overview of your latest theater performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Performance</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performances.slice(0, 5).map((performance) => {
                    const performanceTickets = tickets.filter(t => t.performanceId === performance._id);
                    const validatedTickets = performanceTickets.filter(t => t.isVisited).length;
                    return (
                      <TableRow key={performance._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{performance.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {performance.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDateUTC(performance.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimeUTC(performance.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {performance.venue}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ${performance.price}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline">
                              {performanceTickets.length} total
                            </Badge>
                            {validatedTickets > 0 && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {validatedTickets} validated
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
