import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, ChevronDown } from 'lucide-react';
import { adminApi } from '../../lib/api';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: () => adminApi.users({ page, limit: 20, ...(search && { search }), ...(role && { role }) }).then((r) => r.data),
    placeholderData: (p) => p,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-9" placeholder="Search users…" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-base w-auto">
          <option value="">All roles</option>
          <option value="learner">Learner</option>
          <option value="mentor">Mentor</option>
          <option value="tvet_admin">TVET Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-secondary/30">
                <th>User</th>
                <th>Role</th>
                <th>Region</th>
                <th>Enrollments</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
                : users.map((u: {
                  id: string; firstName: string; lastName: string; email: string;
                  role: string; isActive: boolean; createdAt: string;
                  profile?: { region?: string };
                  _count: { enrollments: number };
                }) => (
                  <tr key={u.id} className={!u.isActive ? 'opacity-50' : ''}>
                    <td>
                      <div>
                        <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                        className="text-xs bg-secondary border border-border rounded-lg px-2 py-1"
                      >
                        <option value="learner">learner</option>
                        <option value="mentor">mentor</option>
                        <option value="tvet_admin">tvet_admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </td>
                    <td><span className="text-xs text-muted-foreground">{u.profile?.region ?? '—'}</span></td>
                    <td><span className="text-sm">{u._count.enrollments}</span></td>
                    <td><span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                    <td>
                      {u.isActive && (
                        <button
                          onClick={() => deactivateMutation.mutate(u.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {meta.total.toLocaleString()} users total
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Prev</button>
              <span className="text-xs text-muted-foreground">{meta.page} / {meta.totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
