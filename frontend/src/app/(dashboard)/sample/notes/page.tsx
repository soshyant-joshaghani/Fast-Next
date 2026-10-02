'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/modules/base/auth-context';
import { ApiError } from '@/lib/modules/base/utils/api-error';
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
  type Note,
} from '@/lib/modules/apps/sample/api';
import { Button } from '@/lib/modules/base/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/modules/base/ui/card';
import { Input } from '@/lib/modules/base/ui/input';
import { Label } from '@/lib/modules/base/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/lib/modules/base/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/modules/base/ui/table';

export default function SampleNotesPage() {
  const router = useRouter();
  const { token, isLoading, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleUnauthorized = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      setNotes(await listNotes(token));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized]);

  useEffect(() => {
    if (isLoading || !token) return;
    void refresh();
  }, [isLoading, token, refresh]);

  function openEdit(note: Note) {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setError('');
  }

  function closeEdit() {
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createNote(token, { title: title.trim(), content: content.trim() || undefined });
      setTitle('');
      setContent('');
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to create note');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedNote || !editTitle.trim()) return;
    setSaving(true);
    setError('');
    try {
      await updateNote(token, selectedNote.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      closeEdit();
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to update note');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      await deleteNote(token, id);
      if (selectedNote?.id === id) closeEdit();
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to delete note');
    } finally {
      setSaving(false);
    }
  }

  const busy = loading || saving;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sample Notes</h1>
        <p className="text-muted-foreground">Canonical CRUD module — Router → Service → Repository</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New note</CardTitle>
            <CardDescription>Create a note via POST /sample/notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy}>
                Create note
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your notes</CardTitle>
            <CardDescription>{loading ? 'Loading…' : `${notes.length} note(s)`}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No notes yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  notes.map((note) => (
                    <TableRow
                      key={note.id}
                      className="cursor-pointer"
                      data-state={selectedNote?.id === note.id ? 'selected' : undefined}
                      onClick={() => openEdit(note)}
                    >
                      <TableCell className="font-medium">{note.title}</TableCell>
                      <TableCell className="text-muted-foreground">{note.content || '—'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(note.id);
                          }}
                          disabled={busy}
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={selectedNote !== null}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
      >
        <SheetContent side="right" className="sm:max-w-md">
          <form onSubmit={(e) => void handleSaveEdit(e)} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Edit note</SheetTitle>
              <SheetDescription>Update the title and content, then save.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Input
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter className="flex-row gap-2 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                disabled={busy || !selectedNote}
                onClick={() => selectedNote && void handleDelete(selectedNote.id)}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={closeEdit} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  Save changes
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
