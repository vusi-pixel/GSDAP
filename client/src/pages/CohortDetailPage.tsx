import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cohortsApi } from '../lib/api';
import { Users, Trophy, Medal } from 'lucide-react';

export default function CohortDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cohort, isLoading } = useQuery({
    queryKey: ['cohort', id],
    queryFn: () => cohortsApi.detail(id!).then((r) => r.data.data),
  });
  const { data: lb } = useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => cohortsApi.leaderboard(id!).then((r) => r.data.data),
  });

  if (isLoading) return <div className="section-container py-10"><div className="skeleton h-64 rounded-2xl" /></div>;

  const medalColor = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/30">
        <div className="section-container py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <Users size={24} className="text-brand-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{cohort?.name}</h1>
              {cohort?.mentor && <p className="text-sm text-muted-foreground">Mentor: {cohort.mentor.firstName} {cohort.mentor.lastName}</p>}
            </div>
          </div>
          {cohort?.description && <p className="text-muted-foreground mt-3">{cohort.description}</p>}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs bg-secondary px-3 py-1.5 rounded-full">{cohort?.members?.length ?? 0} members</span>
            {cohort?.inviteCode && <span className="text-xs font-mono bg-brand-500/10 text-brand-400 px-3 py-1.5 rounded-full">Code: {cohort.inviteCode}</span>}
          </div>
        </div>
      </div>

      <div className="section-container py-8 max-w-4xl">
        <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" /> Leaderboard
        </h2>
        <div className="space-y-3">
          {lb?.map((member: { user: { firstName: string; lastName: string; profile?: { avatarUrl?: string; totalHours?: number } }; score: number }, i: number) => (
            <div key={i} className={`glass-card rounded-2xl p-4 flex items-center gap-4 ${i < 3 ? 'border border-yellow-500/20' : ''}`}>
              <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 ${i < 3 ? medalColor[i] : 'text-muted-foreground'}`}>
                {i < 3 ? <Medal size={20} /> : `#${i + 1}`}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {member.user.firstName[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{member.user.firstName} {member.user.lastName}</p>
                <p className="text-xs text-muted-foreground">{member.user.profile?.totalHours ?? 0}h total</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-400">{member.score}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
