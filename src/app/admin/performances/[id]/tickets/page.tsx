"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay, QRCodePreview } from "@/components/ui/qr-code-display";
import { Performance, Ticket } from "@/types";

export default function PerformanceTickets() {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [allPerformances, setAllPerformances] = useState<Performance[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    performanceId: "",
    placeRow: "",
    placeNumber: "",
    customerPhoneNumber: "",
    customerName: "",
    referenceName: ""
  });

  // Debug state changes
  useEffect(() => {
    console.log("Dialog state changed:", isCreateDialogOpen);
  }, [isCreateDialogOpen]);
  const router = useRouter();
  const params = useParams();
  const performanceId = params.id as string;

  const loadPerformanceAndTickets = useCallback(async () => {
    try {
      const [performanceRes, ticketsRes, allPerformancesRes] = await Promise.all([
        fetch(`/api/performances/${performanceId}`),
        fetch(`/api/tickets?performanceId=${performanceId}`),
        fetch("/api/performances")
      ]);

      const performanceData = await performanceRes.json();
      const ticketsData = await ticketsRes.json();
      const allPerformancesData = await allPerformancesRes.json();

      if (performanceData.success) {
        setPerformance(performanceData.data);
        // Set the current performance as selected in the form
        setNewTicket(prev => ({
          ...prev,
          performanceId: performanceId
        }));
      }
      if (ticketsData.success) {
        setTickets(ticketsData.data);
      }
      if (allPerformancesData.success) {
        setAllPerformances(allPerformancesData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [performanceId]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }
    if (performanceId) {
      loadPerformanceAndTickets();
    }
  }, [router, performanceId, loadPerformanceAndTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating ticket with data:", newTicket);
    
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTicket,
          placeRow: newTicket.placeRow || 1,
          placeNumber: newTicket.placeNumber || 1,
        }),
      });

      const data = await response.json();
      console.log("Ticket creation response:", data);
      
      if (data.success) {
        // Reload the data to get the updated list with QR codes
        await loadPerformanceAndTickets();
        setNewTicket({
          performanceId: performanceId,
          placeRow: "",
          placeNumber: "",
          customerPhoneNumber: "",
          customerName: "",
          referenceName: ""
        });
        setIsCreateDialogOpen(false);
        toast.success("Ticket created successfully!");
      } else {
        toast.error("Error creating ticket: " + data.error);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Error creating ticket: " + (error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading performance tickets...</p>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Performance Not Found</CardTitle>
            <CardDescription>
              The requested performance could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/performances">
              <Button>Back to Performances</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTickets = tickets.length;
  const visitedTickets = tickets.filter(t => t.isVisited).length;
  const pendingTickets = totalTickets - visitedTickets;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/performances">
                <Button variant="ghost" size="sm">
                  ← Back to Performances
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  🎫 {performance.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {new Date(performance.date).toLocaleDateString()} • {performance.venue}
                </p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Ticket
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Ticket</DialogTitle>
                  <DialogDescription>
                    Create a new ticket for {performance?.name}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <Label htmlFor="performanceId">Performance</Label>
                    <Select 
                      value={newTicket.performanceId} 
                      onValueChange={(value) => setNewTicket({...newTicket, performanceId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a performance" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPerformances.map((perf) => (
                          <SelectItem key={perf._id} value={perf._id || ""}>
                            {perf.name} - {new Date(perf.date).toLocaleDateString()}
                            {perf._id === performanceId && " (Current)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="placeRow">Row</Label>
                      <Input
                        id="placeRow"
                        value={newTicket.placeRow}
                        onChange={(e) => setNewTicket({...newTicket, placeRow: e.target.value})}
                        placeholder="e.g., A or 1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="placeNumber">Seat Number</Label>
                      <Input
                        id="placeNumber"
                        value={newTicket.placeNumber}
                        onChange={(e) => setNewTicket({...newTicket, placeNumber: e.target.value})}
                        placeholder="e.g., 15"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={newTicket.customerName}
                      onChange={(e) => setNewTicket({...newTicket, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhoneNumber">Phone Number</Label>
                    <Input
                      id="customerPhoneNumber"
                      value={newTicket.customerPhoneNumber}
                      onChange={(e) => setNewTicket({...newTicket, customerPhoneNumber: e.target.value})}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="referenceName">Reference Name</Label>
                    <Input
                      id="referenceName"
                      value={newTicket.referenceName}
                      onChange={(e) => setNewTicket({...newTicket, referenceName: e.target.value})}
                      placeholder="Booking reference"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Ticket
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎭 Performance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">
                  {new Date(performance.date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Venue</p>
                <p className="text-sm">{performance.venue || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Price</p>
                <p className="text-sm">${performance.price || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{performance.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Badge variant="secondary">🎫</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                sold for this performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validated</CardTitle>
              <Badge variant="default" className="bg-green-500">✅</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitedTickets}</div>
              <p className="text-xs text-muted-foreground">
                tickets checked in
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Badge variant="outline">⏳</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTickets}</div>
              <p className="text-xs text-muted-foreground">
                awaiting check-in
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        {totalTickets === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Tickets Yet</CardTitle>
              <CardDescription>
                Create the first ticket for this performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Tickets ({totalTickets})</h2>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-500">
                  {visitedTickets} validated
                </Badge>
                <Badge variant="outline">
                  {pendingTickets} pending
                </Badge>
              </div>
            </div>
            <Separator />
            {tickets.map((ticket) => (
              <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{ticket.customerName}</h3>
                      <p className="text-muted-foreground">{ticket.customerPhoneNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.isVisited ? (
                        <Badge className="bg-green-500">
                          ✅ Validated
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          ⏳ Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">Seat</p>
                      <p>Row {ticket.placeRow}, Seat {ticket.placeNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">Reference</p>
                      <p>{ticket.referenceName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">Created</p>
                      <p>
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">QR Code</p>
                      <div className="flex items-center gap-2">
                        <QRCodePreview qrCode={ticket.qrCode} />
                        <QRCodeDisplay 
                          qrCode={ticket.qrCode}
                          ticketId={ticket._id}
                          customerName={ticket.customerName}
                          performanceName={performance?.name}
                        />
                      </div>
                    </div>
                  </div>
                  {ticket.isVisited && ticket.visitedAt && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Validated:</strong> {new Date(ticket.visitedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
