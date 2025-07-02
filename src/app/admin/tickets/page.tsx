"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/spinner";
import { QRCodeDisplay, QRCodePreview } from "@/components/ui/qr-code-display";
import { Performance, Ticket } from "@/types";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
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
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [ticketsRes, performancesRes] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/performances")
      ]);

      const ticketsData = await ticketsRes.json();
      const performancesData = await performancesRes.json();

      if (ticketsData.success) {
        setTickets(ticketsData.data);
      }
      if (performancesData.success) {
        setPerformances(performancesData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (data.success) {
        setTickets([...tickets, data.data]);
        setNewTicket({
          performanceId: "",
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
      toast.error("Error creating ticket");
    }
  };

  const getPerformanceName = (performanceId: string) => {
    const performance = performances.find(p => p._id === performanceId);
    return performance ? performance.name : "Unknown Performance";
  };

  if (isLoading) {
    return <LoadingScreen message="Loading tickets..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                🎫 Manage Tickets
              </h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>
                    Create a new ticket for a customer.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <Label htmlFor="performanceId">Performance</Label>
                    <Select value={newTicket.performanceId} onValueChange={(value) => setNewTicket({...newTicket, performanceId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a performance" />
                      </SelectTrigger>
                      <SelectContent>
                        {performances.map((performance) => (
                          <SelectItem key={performance._id} value={performance._id || ""}>
                            {performance.name} - {new Date(performance.date).toLocaleDateString()}
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
                      placeholder="Booking reference or confirmation code"
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
        {tickets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Tickets Yet</CardTitle>
              <CardDescription>
                Create your first ticket to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {getPerformanceName(ticket.performanceId)}
                      </CardTitle>
                      <CardDescription>
                        {ticket.customerName} - {ticket.customerPhoneNumber}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.isVisited ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✅ Validated
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          ⏳ Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">💺 Seat:</span>
                      <p className="text-gray-600">
                        Row {ticket.placeRow}, Seat {ticket.placeNumber}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">📧 Reference:</span>
                      <p className="text-gray-600">{ticket.referenceName}</p>
                    </div>
                    <div>
                      <span className="font-medium">📅 Created:</span>
                      <p className="text-gray-600">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">🔗 QR Code:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <QRCodePreview qrCode={ticket.qrCode} />
                        <QRCodeDisplay 
                          qrCode={ticket.qrCode}
                          ticketId={ticket._id}
                          customerName={ticket.customerName}
                          performanceName={getPerformanceName(ticket.performanceId)}
                        />
                      </div>
                    </div>
                  </div>
                  {ticket.isVisited && ticket.visitedAt && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
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
