import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { userApi } from '../../lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }
    // Decode and set token, then fetch user
    setAuth({ id: '', email: '', firstName: '', lastName: '', role: 'learner', emailVerified: true }, token);
    userApi.me().then((res) => {
      setAuth(res.data.data, token);
      navigate('/dashboard');
    }).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );
}
