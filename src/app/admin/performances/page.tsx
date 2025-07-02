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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/spinner";
import { AdminNav } from "@/components/ui/navigation";
import { Performance } from "@/types";

export default function AdminPerformances() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [newPerformance, setNewPerformance] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    price: ""
  });
  const [editPerformance, setEditPerformance] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    price: ""
  });
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
    setAdminUser(JSON.parse(user));
    loadPerformances();
  }, [router]);

  const loadPerformances = async () => {
    try {
      const response = await fetch("/api/performances");
      const data = await response.json();
      if (data.success) {
        setPerformances(data.data);
      }
    } catch (error) {
      console.error("Error loading performances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/performances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPerformance,
          date: new Date(`${newPerformance.date}T${newPerformance.time}`).toISOString(),
          price: parseFloat(newPerformance.price),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPerformances([...performances, data.data]);
        setNewPerformance({
          name: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          price: ""
        });
        setIsCreateDialogOpen(false);
      } else {
        toast.error("Error creating performance: " + data.error);
      }
    } catch (error) {
      console.error("Error creating performance:", error);
      toast.error("Error creating performance");
    }
  };

  const handleDeletePerformance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this performance?")) {
      return;
    }

    try {
      const response = await fetch(`/api/performances/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPerformances(performances.filter(p => p._id !== id));
        toast.success("Performance deleted successfully");
      } else {
        toast.error("Error deleting performance");
      }
    } catch (error) {
      console.error("Error deleting performance:", error);
      toast.error("Error deleting performance");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin");
  };

  const handleEditPerformance = (performance: Performance) => {
    setEditingPerformance(performance);
    // Convert the date to the format expected by input[type="date"] and input[type="time"]
    const date = new Date(performance.date);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', performance.date);
      toast.error('Error: Invalid date format in performance data');
      return;
    }
    
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().slice(0, 5); // HH:MM
    
    setEditPerformance({
      name: performance.name || '',
      description: performance.description || '',
      date: dateStr,
      time: timeStr,
      venue: performance.venue || '',
      price: performance.price ? performance.price.toString() : '0'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerformance) return;

    try {
      const response = await fetch(`/api/performances/${editingPerformance._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editPerformance,
          date: new Date(`${editPerformance.date}T${editPerformance.time}`).toISOString(),
          price: parseFloat(editPerformance.price),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the performance in the list
        setPerformances(performances.map(p => 
          p._id === editingPerformance._id ? data.data : p
        ));
        setIsEditDialogOpen(false);
        setEditingPerformance(null);
        toast.success("Performance updated successfully");
      } else {
        toast.error("Error updating performance: " + data.error);
      }
    } catch (error) {
      console.error("Error updating performance:", error);
      toast.error("Error updating performance");
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading performances..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav adminUser={adminUser} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🎪 Manage Performances</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                Create Performance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Performance</DialogTitle>
                <DialogDescription>
                  Add a new theater performance to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePerformance} className="space-y-4">
                <div>
                  <Label htmlFor="name">Performance Name</Label>
                  <Input
                    id="name"
                    value={newPerformance.name}
                    onChange={(e) => setNewPerformance({...newPerformance, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPerformance.description}
                    onChange={(e) => setNewPerformance({...newPerformance, description: e.target.value})}
                    placeholder="Enter performance description..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={newPerformance.venue}
                    onChange={(e) => setNewPerformance({...newPerformance, venue: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newPerformance.date}
                      onChange={(e) => setNewPerformance({...newPerformance, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newPerformance.time}
                      onChange={(e) => setNewPerformance({...newPerformance, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newPerformance.price}
                    onChange={(e) => setNewPerformance({...newPerformance, price: e.target.value})}
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
                    Create Performance
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {performances.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Performances Yet</CardTitle>
              <CardDescription>
                Create your first performance to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Performance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {performances.map((performance) => (
              <Card key={performance._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {performance.name}
                        <Badge variant="secondary" className="ml-auto">
                          ${performance.price}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {performance.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => performance._id && handleDeletePerformance(performance._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">📅 Date:</span>
                      <p className="text-gray-600">
                        {new Date(performance.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">🏛️ Venue:</span>
                      <p className="text-gray-600">{performance.venue}</p>
                    </div>
                    <div>
                      <span className="font-medium">💰 Price:</span>
                      <p className="text-gray-600">${performance.price}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/admin/performances/${performance._id}/tickets`}>
                      <Button variant="outline" size="sm">
                        View Tickets
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPerformance(performance)}
                    >
                      Edit Performance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Performance Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Performance</DialogTitle>
              <DialogDescription>
                Update the details of the performance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePerformance} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Performance Name</Label>
                <Input
                  id="edit-name"
                  value={editPerformance.name}
                  onChange={(e) => setEditPerformance({...editPerformance, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editPerformance.description}
                  onChange={(e) => setEditPerformance({...editPerformance, description: e.target.value})}
                  placeholder="Enter performance description..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-venue">Venue</Label>
                <Input
                  id="edit-venue"
                  value={editPerformance.venue}
                  onChange={(e) => setEditPerformance({...editPerformance, venue: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editPerformance.date}
                    onChange={(e) => setEditPerformance({...editPerformance, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editPerformance.time}
                    onChange={(e) => setEditPerformance({...editPerformance, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPerformance.price}
                  onChange={(e) => setEditPerformance({...editPerformance, price: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Performance
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
