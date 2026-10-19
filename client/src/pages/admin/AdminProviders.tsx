import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../lib/api';

const PROVIDER_COLORS: Record<string, string> = {
  coursera: 'bg-blue-500', google: 'bg-green-500',
  microsoft: 'bg-orange-500', nvidia: 'bg-emerald-500', tvet: 'bg-purple-500',
};

export default function AdminProviders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: () => adminApi.providers().then((r) => r.data.data),
  });
  const { data: logs } = useQuery({
    queryKey: ['admin-sync-logs'],
    queryFn: () => adminApi.syncLogs().then((r) => r.data.data),
  });

  const syncMutation = useMutation({
    mutationFn: (name: string) => adminApi.syncProvider(name),
    onSuccess: () => setTimeout(() => qc.invalidateQueries({ queryKey: ['admin-sync-logs'] }), 2000),
  });

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="font-display text-3xl font-bold">Providers</h1>
        <p className="text-muted-foreground">Manage content provider integrations and sync jobs</p>
      </div>

      {/* Provider cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
          : data?.map((p: { name: string; displayName: string; _count: { courses: number }; syncLogs: Array<{ status: string; startedAt: string; coursesAdded: number; coursesUpdated: number }> }) => {
            const lastSync = p.syncLogs?.[0];
            return (
              <div key={p.name} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${PROVIDER_COLORS[p.name] ?? 'bg-gray-500'} flex items-center justify-center text-white font-bold text-sm`}>
                    {p.displayName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{p.displayName}</p>
                    <p className="text-xs text-muted-foreground">{p._count.courses} courses</p>
                  </div>
                </div>

                {lastSync && (
                  <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                    <div className="flex items-center gap-1">
                      {lastSync.status === 'success'
                        ? <CheckCircle size={12} className="text-green-400" />
                        : lastSync.status === 'failed'
                        ? <XCircle size={12} className="text-destructive" />
                        : <RefreshCw size={12} className="animate-spin text-brand-400" />}
                      Last sync: {lastSync.status}
                    </div>
                    <p>{new Date(lastSync.startedAt).toLocaleString()}</p>
                    <p>+{lastSync.coursesAdded} added · ~{lastSync.coursesUpdated} updated</p>
                  </div>
                )}

                <button
                  onClick={() => syncMutation.mutate(p.name)}
                  disabled={syncMutation.isPending}
                  className="btn-secondary w-full text-xs gap-2"
                >
                  {syncMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Sync Now
                </button>
              </div>
            );
          })
        }
      </div>

      {/* Sync log */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-bold text-lg">Sync History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Provider</th><th>Status</th><th>Added</th><th>Updated</th><th>Started</th><th>By</th></tr>
            </thead>
            <tbody>
              {logs?.slice(0, 20).map((log: { id: string; status: string; provider: { displayName: string }; coursesAdded: number; coursesUpdated: number; startedAt: string; triggeredBy: string }) => (
                <tr key={log.id}>
                  <td className="font-medium text-sm">{log.provider.displayName}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.status === 'success' ? 'bg-green-500/15 text-green-400'
                      : log.status === 'failed' ? 'bg-destructive/15 text-destructive'
                      : 'bg-yellow-500/15 text-yellow-400'
                    }`}>{log.status}</span>
                  </td>
                  <td className="text-sm">{log.coursesAdded}</td>
                  <td className="text-sm">{log.coursesUpdated}</td>
                  <td className="text-xs text-muted-foreground">{new Date(log.startedAt).toLocaleString()}</td>
                  <td className="text-xs text-muted-foreground">{log.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
