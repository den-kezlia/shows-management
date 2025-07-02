"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/spinner";
import { QRCodeDisplay, QRCodePreview } from "@/components/ui/qr-code-display";
import { AdminNav } from "@/components/ui/navigation";
import { Performance, Ticket } from "@/types";
import { Trash2, Edit, QrCode, Send } from "lucide-react";

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
    referenceName: "",
  });
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Verify token and get admin user
    fetch("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Token verification failed");
        }
        const data = await res.json();
        setAdminUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        router.push("/admin");
      });

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [ticketsRes, performancesRes] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/performances"),
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
          referenceName: "",
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
    const performance = performances.find((p) => p._id === performanceId);
    return performance ? performance.name : "Unknown Performance";
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  if (isLoading) {
    return <LoadingScreen message="Loading tickets..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={adminUser} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            🎫 Manage Tickets
          </h1>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create New Ticket</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <Label htmlFor="performance">Performance</Label>
                  <Select
                    value={newTicket.performanceId}
                    onValueChange={(value) =>
                      setNewTicket({ ...newTicket, performanceId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select performance" />
                    </SelectTrigger>
                    <SelectContent>
                      {performances.map((performance) => (
                        <SelectItem key={performance._id} value={performance._id}>
                          {performance.title} - {performance.date} at{" "}
                          {performance.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newTicket.customerName}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, customerName: e.target.value })
                    }
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={newTicket.customerEmail}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, customerEmail: e.target.value })
                    }
                    placeholder="Enter customer email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="seatNumber">Seat Number</Label>
                  <Input
                    id="seatNumber"
                    value={newTicket.seatNumber}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, seatNumber: e.target.value })
                    }
                    placeholder="Enter seat number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newTicket.price}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, price: e.target.value })
                    }
                    placeholder="Enter ticket price"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newTicket.notes}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Ticket
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
      </div>
    </div>
  );
}
