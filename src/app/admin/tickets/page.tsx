"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/spinner";
import { QRCodeDisplay, QRCodePreview } from "@/components/ui/qr-code-display";
import { AdminNav } from "@/components/ui/navigation";
import { Performance, Ticket } from "@/types";
import { Trash2, Edit } from "lucide-react";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [newTicket, setNewTicket] = useState({
    performanceId: "",
    placeRow: "",
    placeNumber: "",
    customerPhoneNumber: "",
    customerName: "",
  referenceName: "",
  status: 'pending',
  });
  const [editTicket, setEditTicket] = useState({
    performanceId: "",
    placeRow: "",
    placeNumber: "",
    customerPhoneNumber: "",
    customerName: "",
  referenceName: "",
  status: 'paid',
  });
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null);
  const [sortBy, setSortBy] = useState<'performance' | 'date' | 'customer' | 'status'>('performance');
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
        setAdminUser(data.data.admin);
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
          status: newTicket.status,
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
          status: 'pending',
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

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    // Handle case where performanceId might be populated with Performance object
    let performanceId: string;
    if (typeof ticket.performanceId === 'string') {
      performanceId = ticket.performanceId;
    } else {
      // TypeScript workaround for populated performance
      performanceId = (ticket.performanceId as unknown as Performance)?._id || '';
    }
    
    setEditTicket({
      performanceId: performanceId,
      placeRow: ticket.placeRow?.toString() || "",
      placeNumber: ticket.placeNumber?.toString() || "",
      customerPhoneNumber: ticket.customerPhoneNumber,
      customerName: ticket.customerName,
  referenceName: ticket.referenceName || "",
  status: ticket.status || 'paid',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    try {
      const response = await fetch(`/api/tickets/${editingTicket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editTicket,
          placeRow: parseInt(editTicket.placeRow) || 1,
          placeNumber: parseInt(editTicket.placeNumber) || 1,
          status: editTicket.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTickets(tickets.map(t => 
          t._id === editingTicket._id ? data.data : t
        ));
        setIsEditDialogOpen(false);
        setEditingTicket(null);
        toast.success("Ticket updated successfully!");
      } else {
        toast.error("Error updating ticket: " + data.error);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Error updating ticket");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setTickets(tickets.filter(t => t._id !== ticketId));
        toast.success("Ticket deleted successfully!");
      } else {
        toast.error("Error deleting ticket: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Error deleting ticket");
    }
  };

  const getPerformanceName = (performanceId: string | Performance) => {
    // If performanceId is already populated (object), use its name directly
    if (typeof performanceId === 'object' && performanceId?.name) {
      return performanceId.name;
    }
    // Otherwise, find it in the performances array
    const performance = performances.find((p) => p._id === performanceId);
    return performance ? performance.name : "Unknown Performance";
  };

  const getSortedTickets = () => {
    return [...tickets].sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          const performanceNameA = getPerformanceName(a.performanceId).toLowerCase();
          const performanceNameB = getPerformanceName(b.performanceId).toLowerCase();
          return performanceNameA.localeCompare(performanceNameB);
        case 'date':
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // Newest first
        case 'customer':
          return a.customerName.toLowerCase().localeCompare(b.customerName.toLowerCase());
        case 'status':
          // Pending tickets first, then validated
          if (a.isVisited === b.isVisited) {
            return getPerformanceName(a.performanceId).toLowerCase().localeCompare(getPerformanceName(b.performanceId).toLowerCase());
          }
          return a.isVisited ? 1 : -1;
        default:
          return 0;
      }
    });
  };

  const getGroupedTickets = () => {
    const sortedTickets = getSortedTickets();
    const grouped: { [key: string]: Ticket[] } = {};
    
    sortedTickets.forEach(ticket => {
      const performanceName = getPerformanceName(ticket.performanceId);
      if (!grouped[performanceName]) {
        grouped[performanceName] = [];
      }
      grouped[performanceName].push(ticket);
    });
    
    return grouped;
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
      <AdminNav adminUser={adminUser} onLogout={handleLogout} />

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
                        <SelectItem key={performance._id} value={performance._id || ""}>
                          {performance.name} - {new Date(performance.date).toLocaleDateString()}
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
                  <Label htmlFor="customerPhoneNumber">Phone Number</Label>
                  <Input
                    id="customerPhoneNumber"
                    value={newTicket.customerPhoneNumber}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, customerPhoneNumber: e.target.value })
                    }
                    placeholder="Enter customer phone number"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="placeRow">Row</Label>
                    <Input
                      id="placeRow"
                      value={newTicket.placeRow}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, placeRow: e.target.value })
                      }
                      placeholder="Enter row"
                    />
                  </div>
                  <div>
                    <Label htmlFor="placeNumber">Seat Number</Label>
                    <Input
                      id="placeNumber"
                      value={newTicket.placeNumber}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, placeNumber: e.target.value })
                      }
                      placeholder="Enter seat number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="referenceName">Reference Name (Optional)</Label>
                  <Input
                    id="referenceName"
                    value={newTicket.referenceName}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, referenceName: e.target.value })
                    }
                    placeholder="Enter reference name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newTicket.status}
                    onValueChange={(value) => setNewTicket({ ...newTicket, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="paid">💳 Paid</SelectItem>
                      <SelectItem value="approved">✅ Approved</SelectItem>
                    </SelectContent>
                  </Select>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                📋 {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} across {Object.keys(getGroupedTickets()).length} performance{Object.keys(getGroupedTickets()).length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="sortBy" className="text-sm text-gray-600">Sort within groups:</Label>
                <Select value={sortBy} onValueChange={(value: 'performance' | 'date' | 'customer' | 'status') => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">🎭 Performance</SelectItem>
                    <SelectItem value="date">📅 Date Created</SelectItem>
                    <SelectItem value="customer">👤 Customer</SelectItem>
                    <SelectItem value="status">✅ Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {Object.entries(getGroupedTickets()).map(([performanceName, performanceTickets]) => {
              const validatedCount = performanceTickets.filter(t => t.isVisited).length;
              const pendingCount = performanceTickets.length - validatedCount;
              
              return (
                <div key={performanceName} className="space-y-4">
                  <div className="sticky top-0 z-10 flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        🎭 {performanceName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {performanceTickets.length} ticket{performanceTickets.length !== 1 ? 's' : ''} • 
                        <span className="text-green-600 font-medium ml-1">✅ {validatedCount} validated</span> • 
                        <span className="text-yellow-600 font-medium ml-1">⏳ {pendingCount} pending</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-700">{performanceTickets.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">tickets</div>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 pl-4 border-l-2 border-blue-100">
                    {performanceTickets.map((ticket) => (
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
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTicket(ticket)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => ticket._id && handleDeleteTicket(ticket._id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Ticket Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Ticket</DialogTitle>
              <DialogDescription>
                Update ticket information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div>
                <Label htmlFor="editPerformanceId">Performance</Label>
                <Select 
                  value={editTicket.performanceId} 
                  onValueChange={(value) => setEditTicket({...editTicket, performanceId: value})}
                >
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
                  <Label htmlFor="editPlaceRow">Row</Label>
                  <Input
                    id="editPlaceRow"
                    value={editTicket.placeRow}
                    onChange={(e) => setEditTicket({...editTicket, placeRow: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editPlaceNumber">Seat</Label>
                  <Input
                    id="editPlaceNumber"
                    value={editTicket.placeNumber}
                    onChange={(e) => setEditTicket({...editTicket, placeNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editCustomerName">Customer Name</Label>
                <Input
                  id="editCustomerName"
                  value={editTicket.customerName}
                  onChange={(e) => setEditTicket({...editTicket, customerName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editCustomerPhoneNumber">Phone Number</Label>
                <Input
                  id="editCustomerPhoneNumber"
                  value={editTicket.customerPhoneNumber}
                  onChange={(e) => setEditTicket({...editTicket, customerPhoneNumber: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editReferenceName">Reference Name (Optional)</Label>
                <Input
                  id="editReferenceName"
                  value={editTicket.referenceName}
                  onChange={(e) => setEditTicket({...editTicket, referenceName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editTicket.status}
                  onValueChange={(value) => setEditTicket({ ...editTicket, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Pending</SelectItem>
                    <SelectItem value="paid">💳 Paid</SelectItem>
                    <SelectItem value="approved">✅ Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Ticket</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
