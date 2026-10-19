import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { Building2, Users, BookOpen, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function TvetDashboard() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', country: '', region: '', website: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: () => adminApi.institutions().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => adminApi.createInstitution(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-institutions'] }); setShowForm(false); setForm({ name: '', country: '', region: '', website: '' }); },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="font-display text-3xl font-bold">TVET Programs</h1>
          <p className="text-muted-foreground">Technical and Vocational Education institutions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-2">
          <Plus size={16} /> Add Institution
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold">New Institution</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Institution Name *</label>
              <input className="input-base" placeholder="e.g. Technical College of Nairobi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Country *</label>
              <input className="input-base" placeholder="Kenya" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Region</label>
              <input className="input-base" placeholder="Nairobi" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input className="input-base" placeholder="https://..." value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.country || createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Institutions list */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
          : data?.map((inst: { id: string; name: string; country: string; region?: string; _count: { courses: number; staff: number; cohorts: number } }) => (
            <div key={inst.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Building2 size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{inst.name}</p>
                  <p className="text-xs text-muted-foreground">{inst.country}{inst.region ? ` · ${inst.region}` : ''}</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen size={11} /> {inst._count.courses} courses</span>
                <span className="flex items-center gap-1"><Users size={11} /> {inst._count.staff} staff</span>
              </div>
            </div>
          ))
        }
      </div>

      {!isLoading && !data?.length && (
        <div className="text-center py-16">
          <Building2 size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No institutions yet. Add one above.</p>
        </div>
      )}
    </div>
  );
}
