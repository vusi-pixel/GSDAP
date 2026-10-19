import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 w-full max-w-md">
        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Password reset!</h2>
            <p className="text-muted-foreground text-sm mb-6">Your password has been updated. You can now log in.</p>
            <Link to="/login" className="btn-primary justify-center w-full">Log In</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold mb-2">Set new password</h1>
            <p className="text-sm text-muted-foreground mb-6">Min 8 chars, 1 uppercase letter, 1 number.</p>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-base pr-10" placeholder="New password" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit" disabled={loading || !token} className="btn-primary w-full py-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
