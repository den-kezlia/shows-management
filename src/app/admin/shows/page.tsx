"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { formatDateUTC } from '@/lib/utils';
import { AdminNav } from '@/components/ui/navigation';
import { Show, Performance } from '@/types';

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newShow, setNewShow] = useState({ name: '', description: '', performanceIds: [] as string[], mainImage: '', galleryImages: [] as string[], galleryInput: '' });
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [perfFilter, setPerfFilter] = useState('');
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (!token || !user) {
      router.push('/admin');
      return;
    }
    setAdminUser(JSON.parse(user));
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [showsRes, performancesRes] = await Promise.all([
        fetch('/api/shows'),
        fetch('/api/performances')
      ]);
      const showsData = await showsRes.json();
      const performancesData = await performancesRes.json();
      if (showsData.success) setShows(showsData.data);
      if (performancesData.success) setPerformances(performancesData.data);
    } catch {
      // noop
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newShow.name,
          description: newShow.description,
          performanceIds: newShow.performanceIds,
          mainImage: newShow.mainImage || undefined,
          galleryImages: newShow.galleryImages,
        })
      });
      const data = await res.json();
      if (data.success) {
        setShows([data.data, ...shows]);
        setNewShow({ name: '', description: '', performanceIds: [], mainImage: '', galleryImages: [], galleryInput: '' });
        setIsCreateDialogOpen(false);
        toast.success('Show created');
        loadData();
      } else {
        toast.error(data.error || 'Failed to create show');
      }
    } catch {
      toast.error('Failed to create show');
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading shows...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav adminUser={adminUser} onLogout={() => { localStorage.clear(); router.push('/admin'); }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">🎞️ Shows</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Show</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Show</DialogTitle>
                <DialogDescription>Add a new show and optionally link a performance.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateShow} className="space-y-4">
                <div>
                  <Label htmlFor="showName">Name</Label>
                  <Input id="showName" value={newShow.name} onChange={e => setNewShow({ ...newShow, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="showDescription">Description</Label>
                  <Textarea id="showDescription" value={newShow.description} onChange={e => setNewShow({ ...newShow, description: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="mainImageFile">Main Image (optional)</Label>
                  {newShow.mainImage && (
                    <div className="mt-2 relative inline-block group h-32 w-48">
                      <Image src={newShow.mainImage} alt="Main preview" fill sizes="(max-width: 768px) 192px, 192px" className="rounded border object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewShow(prev => ({ ...prev, mainImage: '' }))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 text-sm hidden group-hover:flex items-center justify-center"
                        aria-label="Remove main image"
                      >×</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Input id="mainImageFile" type="file" accept="image/*" onChange={async e => {
                      if (!e.target.files?.length) return;
                      try {
                        setIsUploadingMain(true);
                        const [url] = await uploadFiles(e.target.files);
                        setNewShow(prev => ({ ...prev, mainImage: url }));
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
                  <Label>Gallery Image URLs (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add image URL and press Add"
                      value={newShow.galleryInput}
                      onChange={e => setNewShow({ ...newShow, galleryInput: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!newShow.galleryInput.trim()) return;
                        setNewShow(prev => ({
                          ...prev,
                          galleryImages: [...prev.galleryImages, prev.galleryInput.trim()],
                          galleryInput: ''
                        }));
                      }}
                    >Add</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input id="galleryFiles" type="file" accept="image/*" multiple onChange={async e => {
                      if (!e.target.files?.length) return;
                      try {
                        setIsUploadingGallery(true);
                        const urls = await uploadFiles(e.target.files);
                        setNewShow(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...urls] }));
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
                  {newShow.galleryImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {newShow.galleryImages.map((url, idx) => (
                        <div key={idx} className="relative group h-16 w-16">
                          <Image src={url} alt="Gallery" fill sizes="64px" className="object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => setNewShow(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== idx) }))}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 text-xs hidden group-hover:flex items-center justify-center"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Attach Performances</Label>
                    <Input
                      placeholder="Filter performances..."
                      value={perfFilter}
                      onChange={e => setPerfFilter(e.target.value)}
                    />
                    <div className="max-h-48 overflow-auto border rounded-md p-2 space-y-1 bg-white">
                      {performances
                        .filter(p => p.name.toLowerCase().includes(perfFilter.toLowerCase()))
                        .map(p => {
                          const checked = newShow.performanceIds.includes(p._id || '');
                          return (
                            <label
                              key={p._id}
                              className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={checked}
                                onChange={() => {
                                  const id = p._id || '';
                                  setNewShow(prev => ({
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
                      {performances.filter(p => p.name.toLowerCase().includes(perfFilter.toLowerCase())).length === 0 && (
                        <div className="text-xs text-muted-foreground p-2">No performances match filter.</div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Use checkboxes to attach multiple performances.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Show</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {shows.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Shows Yet</CardTitle>
              <CardDescription>Create your first show.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create First Show</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {shows.map(show => (
              <Card key={show._id} className="hover:shadow overflow-hidden">
                {show.mainImage && (
                  <div className="h-40 w-full overflow-hidden border-b bg-gray-100 relative">
                    <Image src={show.mainImage} alt={show.name} fill sizes="100vw" className="object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <CardTitle className="flex items-center gap-2">
                        {show.name}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">{show.description}</CardDescription>
                    </div>
                    <Link href={`/admin/shows/${show._id}`}>
                      <Button size="sm" variant="outline">Open</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
