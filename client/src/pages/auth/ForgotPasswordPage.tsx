import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 w-full max-w-md">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Check your inbox</h2>
            <p className="text-muted-foreground text-sm mb-6">If that email exists, we've sent a reset link valid for 1 hour.</p>
            <Link to="/login" className="btn-primary justify-center w-full">Back to Login</Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn-ghost mb-6 inline-flex"><ArrowLeft size={16} /> Back</Link>
            <h1 className="font-display text-2xl font-bold mb-2">Forgot your password?</h1>
            <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a reset link.</p>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" placeholder="you@example.com" required />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
