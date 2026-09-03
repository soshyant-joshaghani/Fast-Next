'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/modules/global/auth-context';
import { ApiError } from '@/lib/modules/global/utils/api-error';
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type ManagedUser,
} from '@/lib/modules/base/users-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUnauthorized = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setStatus('');
    try {
      const data = await listUsers(token);
      setUsers(data);
      setStatus(`${data.length} user(s)`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setUsers([]);
      setStatus(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized]);

  useEffect(() => {
    if (user && !user.is_superuser) {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (isLoading || !token || !user?.is_superuser) return;
    void refresh();
  }, [isLoading, token, user, refresh]);

  function clearForm() {
    setSelectedId(null);
    setEmail('');
    setFullName('');
    setPassword('');
    setIsActive(false);
    setIsSuperuser(false);
    setStatus('New user');
  }

  function selectUser(managedUser: ManagedUser) {
    setSelectedId(managedUser.id);
    setEmail(managedUser.email);
    setFullName(managedUser.full_name ?? '');
    setPassword('');
    setIsActive(managedUser.is_active);
    setIsSuperuser(managedUser.is_superuser);
    setStatus(`Editing: ${managedUser.email}`);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus('Email is required');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      if (selectedId) {
        await updateUser(token, selectedId, {
          email: trimmedEmail,
          full_name: fullName.trim() || null,
          password: password || undefined,
          is_active: isActive,
          is_superuser: isSuperuser,
        });
        setStatus('User updated');
      } else {
        if (password.length < 8) {
          setStatus('Password must be at least 8 characters');
          setSaving(false);
          return;
        }
        await createUser(token, {
          email: trimmedEmail,
          password,
          full_name: fullName.trim() || null,
          is_active: isActive,
          is_superuser: isSuperuser,
        });
        setStatus('User created');
      }
      clearForm();
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !selectedId) return;
    if (user?.id === selectedId) {
      setStatus('Cannot delete your own account here');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      await deleteUser(token, selectedId);
      setStatus('User deleted');
      clearForm();
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleUnauthorized();
        return;
      }
      setStatus(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  if (!user?.is_superuser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button type="button" variant="secondary" onClick={clearForm}>
          Add user
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>All users</CardTitle>
            <CardDescription>{loading ? 'Loading…' : status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!loading && users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              users.map((managedUser) => (
                <Button
                  key={managedUser.id}
                  type="button"
                  variant={managedUser.id === selectedId ? 'default' : 'outline'}
                  className="h-auto w-full justify-start py-2 text-left"
                  onClick={() => selectUser(managedUser)}
                >
                  <span className="truncate">
                    {managedUser.email}
                    {managedUser.is_superuser ? ' (superuser)' : ''}
                  </span>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedId ? 'Edit user' : 'New user'}</CardTitle>
            <CardDescription>
              {selectedId ? 'Update account details' : 'Create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-full-name">Full name</Label>
                <Input
                  id="admin-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">
                  Password {selectedId ? '(leave blank to keep)' : '(required)'}
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="admin-active">Is active</Label>
                <Switch id="admin-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="admin-superuser">Is superuser</Label>
                <Switch
                  id="admin-superuser"
                  checked={isSuperuser}
                  onCheckedChange={setIsSuperuser}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={saving || !selectedId}
                  onClick={() => void handleDelete()}
                >
                  Delete
                </Button>
              </div>
              {status ? (
                <p className={cn('text-sm', status.includes('failed') && 'text-destructive')}>
                  {status}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
