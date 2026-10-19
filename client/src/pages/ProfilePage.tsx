import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../lib/api';
import { Award, Clock, Globe, Target } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id!).then((r) => r.data.data),
  });

  if (isLoading) return <div className="section-container py-10 max-w-2xl"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!data) return null;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/30">
        <div className="section-container py-10 max-w-3xl">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-3xl font-black flex-shrink-0">
              {data.firstName[0]}{data.lastName[0]}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{data.firstName} {data.lastName}</h1>
              <p className="text-muted-foreground capitalize mt-1">{data.role.replace('_', ' ')}</p>
              {data.profile?.bio && <p className="text-sm mt-3 max-w-md leading-relaxed">{data.profile.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {data.profile?.region && <span className="flex items-center gap-1"><Globe size={14} /> {data.profile.region}</span>}
                {data.profile?.totalHours > 0 && <span className="flex items-center gap-1"><Clock size={14} /> {data.profile.totalHours}h</span>}
                {data.profile?.streakDays > 0 && <span>🔥 {data.profile.streakDays}d streak</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8 max-w-3xl space-y-6">
        {data.profile?.goals?.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold mb-3 flex items-center gap-2"><Target size={18} className="text-brand-400" /> Learning Goals</h2>
            <div className="flex flex-wrap gap-2">
              {data.profile.goals.map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-lg bg-secondary text-sm">{g.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
        )}

        {data.credentials?.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-400" /> Credentials</h2>
            <div className="space-y-3">
              {data.credentials.map((c: { id: string; title: string; type: string; issuedAt: string; verifyCode: string }) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <a href={`/credentials/verify/${c.verifyCode}`} target="_blank" className="text-xs text-brand-400 hover:underline">Verify</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
