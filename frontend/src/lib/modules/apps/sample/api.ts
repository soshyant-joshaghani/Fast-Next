import { apiBaseUrl } from '@/lib/config/backend';
import { ApiError } from '@/lib/modules/base/utils/api-error';
import { authFetch } from '@/lib/modules/base/utils/auth-fetch';

export type Note = {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type NoteCreate = {
  title: string;
  content?: string;
};

export type NoteUpdate = {
  title?: string;
  content?: string;
};

async function parseError(res: Response, fallback: string): Promise<never> {
  throw new ApiError(fallback, res.status);
}

export async function listNotes(token: string): Promise<Note[]> {
  const res = await authFetch(token, `${apiBaseUrl()}/sample/notes`);
  if (!res.ok) return parseError(res, `Failed to load notes (${res.status})`);
  return res.json();
}

export async function createNote(token: string, data: NoteCreate): Promise<Note> {
  const res = await authFetch(token, `${apiBaseUrl()}/sample/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res, `Failed to create note (${res.status})`);
  return res.json();
}

export async function updateNote(token: string, id: string, data: NoteUpdate): Promise<Note> {
  const res = await authFetch(token, `${apiBaseUrl()}/sample/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res, `Failed to update note (${res.status})`);
  return res.json();
}

export async function deleteNote(token: string, id: string): Promise<void> {
  const res = await authFetch(token, `${apiBaseUrl()}/sample/notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) return parseError(res, `Failed to delete note (${res.status})`);
}
