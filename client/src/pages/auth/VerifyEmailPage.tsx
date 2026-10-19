import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => { setStatus('error'); setMessage(err?.response?.data?.message || 'Verification failed.'); });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4">
      <div className="glass-card rounded-3xl p-10 text-center max-w-md w-full">
        {status === 'loading' && <Loader2 size={36} className="animate-spin text-brand-500 mx-auto mb-4" />}
        {status === 'success' && (
          <>
            <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Email verified!</h2>
            <p className="text-muted-foreground text-sm mb-6">Your account is active. You can now log in.</p>
            <Link to="/login" className="btn-primary justify-center w-full">Log In</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={40} className="text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Verification failed</h2>
            <p className="text-muted-foreground text-sm mb-6">{message}</p>
            <Link to="/register" className="btn-primary justify-center w-full">Try Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
