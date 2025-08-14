"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Show, Performance } from '@/types';
import { AdminNav } from '@/components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDateUTC } from '@/lib/utils';

export default function ShowDetailsPage() {
  const params = useParams();
  const showId = params.id as string;
  const router = useRouter();
  const [show, setShow] = useState<Show | null>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null);
  const [isCreatePerformanceOpen, setIsCreatePerformanceOpen] = useState(false);
  const [newPerformance, setNewPerformance] = useState({
    name: '', description: '', date: '', time: '', venue: '', price: ''
  });
  const [isEditShowOpen, setIsEditShowOpen] = useState(false);
  const [editShow, setEditShow] = useState({ name: '', description: '', performanceIds: [] as string[], mainImage: '', galleryImages: [] as string[], galleryInput: '' });
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [editPerfFilter, setEditPerfFilter] = useState('');
  const [allPerformances, setAllPerformances] = useState<Performance[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      router.push('/admin');
      return;
    }
    setAdminUser(JSON.parse(user));
  }, [router]);

  const loadData = useCallback(async () => {
    try {
      const [showRes, perfRes, allPerfRes] = await Promise.all([
        fetch(`/api/shows/${showId}`),
        fetch(`/api/performances?showId=${showId}`),
        fetch('/api/performances')
      ]);
      const showData = await showRes.json();
      const perfData = await perfRes.json();
      const allPerfData = await allPerfRes.json();
      if (showData.success) setShow(showData.data);
      if (perfData.success) setPerformances(perfData.data);
      if (allPerfData.success) setAllPerformances(allPerfData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    if (showId) loadData();
  }, [showId, loadData]);

  // loadData is defined above using useCallback

  const openEditShow = () => {
    if (!show) return;
    setEditShow({
      name: show.name,
      description: show.description,
      performanceIds: show.performanceIds || performances.map(p => p._id!).filter(Boolean),
      mainImage: show.mainImage || '',
      galleryImages: show.galleryImages || [],
      galleryInput: ''
    });
    setIsEditShowOpen(true);
  };

  const handleUpdateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/shows/${showId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editShow.name,
          description: editShow.description,
          performanceIds: editShow.performanceIds,
          mainImage: editShow.mainImage || undefined,
          galleryImages: editShow.galleryImages,
        })
      });
  const data = await res.json();
      if (data.success) {
        setShow(data.data);
        toast.success('Show updated');
  setIsEditShowOpen(false);
  // Reload performances to reflect updated associations
  await loadData();
      } else {
        toast.error(data.error || 'Failed to update show');
      }
  } catch {
      toast.error('Failed to update show');
    }
  };

  const handleCreatePerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/performances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPerformance,
          date: new Date(`${newPerformance.date}T${newPerformance.time}`).toISOString(),
          price: parseFloat(newPerformance.price),
          showId,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Performance created');
        setPerformances([...performances, data.data]);
        setIsCreatePerformanceOpen(false);
        setNewPerformance({ name: '', description: '', date: '', time: '', venue: '', price: '' });
      } else {
        toast.error(data.error || 'Failed to create performance');
      }
  } catch {
      toast.error('Failed to create performance');
    }
  };

  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files', f));
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.urls as string[];
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading show...</div>;
  if (!show) return <div className="min-h-screen flex items-center justify-center">Show not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav adminUser={adminUser} onLogout={() => { localStorage.clear(); router.push('/admin'); }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">🎞️ {show.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{show.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/shows"><Button variant="outline" size="sm">← Back</Button></Link>
            <Button size="sm" variant="outline" onClick={openEditShow}>Edit Show</Button>
            <Button size="sm" onClick={() => setIsCreatePerformanceOpen(true)}>Add Performance</Button>
          </div>
        </div>

        <Card className="mb-8 overflow-hidden">
          {show.mainImage && (
            <div className="w-full h-56 bg-gray-100 border-b overflow-hidden relative">
              <Image src={show.mainImage} alt={show.name} fill priority sizes="100vw" className="object-cover" />
            </div>
          )}
          <CardHeader>
            <CardTitle>Show Information</CardTitle>
            <CardDescription>Overview of this show and its performances.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm"><span className="font-medium">Total Performances:</span> {performances.length}</p>
            {show.galleryImages && show.galleryImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Gallery</p>
                <div className="flex flex-wrap gap-3">
                  {show.galleryImages.map((url, idx) => (
                    <div key={idx} className="relative h-16 w-16">
                      <Image src={url} alt="Gallery" fill sizes="64px" className="object-cover rounded border" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {performances.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Performances</CardTitle>
                <CardDescription>Create the first performance for this show.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsCreatePerformanceOpen(true)}>Create Performance</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {performances.map(performance => (
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
                      <Link href={`/admin/performances/${performance._id}/tickets`}>
                        <Button variant="outline" size="sm">
                          View Tickets
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">📅 Date:</span>
                        <p className="text-gray-600">
                          {formatDateUTC(performance.date)}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isCreatePerformanceOpen} onOpenChange={setIsCreatePerformanceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Performance</DialogTitle>
              <DialogDescription>Add a new performance to this show.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePerformance} className="space-y-4">
              <div>
                <Label htmlFor="perfName">Name</Label>
                <Input id="perfName" value={newPerformance.name} onChange={e => setNewPerformance({ ...newPerformance, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="perfDescription">Description</Label>
                <Textarea id="perfDescription" value={newPerformance.description} onChange={e => setNewPerformance({ ...newPerformance, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="perfDate">Date</Label>
                  <Input id="perfDate" type="date" value={newPerformance.date} onChange={e => setNewPerformance({ ...newPerformance, date: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="perfTime">Time</Label>
                  <Input id="perfTime" type="time" value={newPerformance.time} onChange={e => setNewPerformance({ ...newPerformance, time: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="perfVenue">Venue</Label>
                <Input id="perfVenue" value={newPerformance.venue} onChange={e => setNewPerformance({ ...newPerformance, venue: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="perfPrice">Price ($)</Label>
                <Input id="perfPrice" type="number" step="0.01" value={newPerformance.price} onChange={e => setNewPerformance({ ...newPerformance, price: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatePerformanceOpen(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditShowOpen} onOpenChange={setIsEditShowOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Show</DialogTitle>
              <DialogDescription>Update the show information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateShow} className="space-y-4">
              <div>
                <Label htmlFor="showEditName">Name</Label>
                <Input id="showEditName" value={editShow.name} onChange={e => setEditShow({ ...editShow, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="showEditDescription">Description</Label>
                <Textarea id="showEditDescription" value={editShow.description} onChange={e => setEditShow({ ...editShow, description: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="editMainImageFile">Main Image</Label>
                {editShow.mainImage && (
                  <div className="mt-2 relative inline-block group h-28 w-44">
                    <Image src={editShow.mainImage} alt="Main" fill sizes="(max-width: 768px) 176px, 176px" className="rounded border object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditShow(prev => ({ ...prev, mainImage: '' }))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 text-sm hidden group-hover:flex items-center justify-center"
                      aria-label="Remove main image"
                    >×</button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Input id="editMainImageFile" type="file" accept="image/*" onChange={async e => {
                    if (!e.target.files?.length) return;
                    try {
                      setIsUploadingMain(true);
                      const [url] = await uploadFiles(e.target.files);
                      setEditShow(prev => ({ ...prev, mainImage: url }));
                      toast.success('Main image uploaded');
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Failed to upload main image';
                      toast.error(msg);
                    } finally {
                      setIsUploadingMain(false);
                      e.currentTarget.value = '';
                    }
                  }} />
                  {isUploadingMain && <span className="text-xs text-gray-500">Uploading...</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gallery Image URLs</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add image URL and press Add"
                    value={editShow.galleryInput}
                    onChange={e => setEditShow({ ...editShow, galleryInput: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!editShow.galleryInput.trim()) return;
                      setEditShow(prev => ({
                        ...prev,
                        galleryImages: [...prev.galleryImages, prev.galleryInput.trim()],
                        galleryInput: ''
                      }));
                    }}
                  >Add</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input id="editGalleryFiles" type="file" accept="image/*" multiple onChange={async e => {
                    if (!e.target.files?.length) return;
                    try {
                      setIsUploadingGallery(true);
                      const urls = await uploadFiles(e.target.files);
                      setEditShow(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...urls] }));
                      toast.success('Gallery images uploaded');
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Failed to upload gallery images';
                      toast.error(msg);
                    } finally {
                      setIsUploadingGallery(false);
                      e.currentTarget.value = '';
                    }
                  }} />
                  {isUploadingGallery && <span className="text-xs text-gray-500">Uploading...</span>}
                </div>
                {editShow.galleryImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {editShow.galleryImages.map((url, idx) => (
                      <div key={idx} className="relative group h-16 w-16">
                        <Image src={url} alt="Gallery" fill sizes="64px" className="object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => setEditShow(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== idx) }))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 text-xs hidden group-hover:flex items-center justify-center"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Performances</Label>
                <Input
                  placeholder="Filter performances..."
                  value={editPerfFilter}
                  onChange={e => setEditPerfFilter(e.target.value)}
                />
                <div className="max-h-56 overflow-auto border rounded-md p-2 space-y-1 bg-white">
                  {allPerformances
                    .filter(p => p.name.toLowerCase().includes(editPerfFilter.toLowerCase()))
                    .map(p => {
                      const checked = editShow.performanceIds.includes(p._id || '');
                      return (
                        <label key={p._id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={checked}
                            onChange={() => {
                              const id = p._id || '';
                              setEditShow(prev => ({
                                ...prev,
                                performanceIds: checked
                                  ? prev.performanceIds.filter(x => x !== id)
                                  : [...prev.performanceIds, id]
                              }));
                            }}
                          />
                          <span className="flex-1">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatDateUTC(p.date)}</span>
                          </span>
                        </label>
                      );
                    })}
                  {allPerformances.filter(p => p.name.toLowerCase().includes(editPerfFilter.toLowerCase())).length === 0 && (
                    <div className="text-xs text-muted-foreground p-2">No performances match filter.</div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Use checkboxes to attach/detach performances.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditShowOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
