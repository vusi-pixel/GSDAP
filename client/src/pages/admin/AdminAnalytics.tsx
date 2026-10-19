import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#d946ef', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data.data),
  });

  const regionData = data?.signupsByRegion?.slice(0, 8).map((r: { region: string; _count: { userId: number } }) => ({
    name: r.region ?? 'Unknown',
    value: r._count.userId,
  })) ?? [];

  const completionData = data?.completionsByProvider?.map((p: { displayName: string; completions: number }) => ({
    name: p.displayName,
    value: p.completions,
  })) ?? [];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform growth and engagement insights</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-4">Learners by Region</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={regionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {regionData.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Learners']} contentStyle={{ background: '#1a1a3e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-4">Completions by Provider</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={completionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {completionData.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Completions']} contentStyle={{ background: '#1a1a3e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
