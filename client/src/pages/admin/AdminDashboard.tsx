import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-3xl font-display font-black">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-medium">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const syncMutation = useMutation({
    mutationFn: (name: string) => adminApi.syncProvider(name),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const ov = data?.overview;
  const milestoneProgress = ((ov?.milestoneProgress ?? 0) / 1000000) * 100;

  const providerChartData = data?.completionsByProvider?.map((p: { provider: string; completions: number }) => ({
    name: p.provider.charAt(0).toUpperCase() + p.provider.slice(1),
    completions: p.completions,
  })) ?? [];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="font-display text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">Platform-wide metrics and management</p>
      </div>

      {/* Milestone progress */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Journey to 1,000,000 Learners</h2>
          <span className="text-sm text-muted-foreground">{milestoneProgress.toFixed(3)}%</span>
        </div>
        <div className="progress-bar h-3 mb-2">
          <motion.div className="progress-fill h-full" initial={{ width: 0 }} animate={{ width: `${milestoneProgress}%` }} transition={{ duration: 1.5 }} />
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-bold">{ov?.totalLearners?.toLocaleString()}</span> learners · {(1000000 - ov?.totalLearners).toLocaleString()} to go
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={ov?.totalUsers ?? 0} color="bg-brand-500" />
        <StatCard icon={BookOpen} label="Active Courses" value={ov?.totalCourses ?? 0} color="bg-blue-600" />
        <StatCard icon={TrendingUp} label="Enrollments" value={ov?.totalEnrollments ?? 0} color="bg-purple-600" />
        <StatCard icon={Award} label="Completions" value={ov?.totalCompletions ?? 0} sub={`${ov?.completionRate ?? 0}% rate`} color="bg-green-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completions by provider */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-4">Completions by Provider</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={providerChartData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="completions" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top regions */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-4">Top Regions</h2>
          <div className="space-y-3">
            {data?.signupsByRegion?.slice(0, 8).map((r: { region: string; _count: { userId: number } }) => (
              <div key={r.region} className="flex items-center gap-3">
                <span className="text-sm flex-1 truncate">{r.region ?? 'Unknown'}</span>
                <span className="text-sm font-bold text-brand-400">{r._count.userId.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick sync */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display font-bold mb-4 flex items-center gap-2">
          <RefreshCw size={18} className="text-brand-400" /> Provider Sync
        </h2>
        <div className="flex flex-wrap gap-3">
          {['coursera', 'google', 'microsoft', 'nvidia', 'tvet'].map((p) => (
            <button
              key={p}
              onClick={() => syncMutation.mutate(p)}
              disabled={syncMutation.isPending}
              className="btn-secondary gap-2 text-sm"
            >
              {syncMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Sync {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {syncMutation.isSuccess && (
          <p className="text-xs text-green-400 mt-3 flex items-center gap-1">
            <CheckCircle2 size={13} /> Sync job queued
          </p>
        )}
      </div>
    </div>
  );
}
