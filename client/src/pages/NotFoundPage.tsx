import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center hero-bg px-4">
      <div className="orb w-80 h-80 bg-brand-500 top-[-10%] right-[10%]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10">
        <p className="text-9xl font-black gradient-text mb-4">404</p>
        <h1 className="font-display text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or was moved.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary"><ArrowLeft size={16} /> Go back</button>
          <Link to="/" className="btn-primary"><Home size={16} /> Home</Link>
        </div>
      </motion.div>
    </div>
  );
}
