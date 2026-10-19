import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { userApi } from '../../lib/api';
import { OnboardingSchema } from '@omc/shared';
import { z } from 'zod';

type OnboardingForm = z.infer<typeof OnboardingSchema>;

const STEPS = ['Skill Level', 'Goals', 'Location', 'Preferences'] as const;

const GOALS = [
  { id: 'data_science', label: 'Data Science & AI', emoji: '🧠' },
  { id: 'machine_learning', label: 'Machine Learning', emoji: '🤖' },
  { id: 'web_development', label: 'Web Development', emoji: '💻' },
  { id: 'cloud_computing', label: 'Cloud Computing', emoji: '☁️' },
  { id: 'cybersecurity', label: 'Cybersecurity', emoji: '🔒' },
  { id: 'mobile_development', label: 'Mobile Dev', emoji: '📱' },
  { id: 'devops', label: 'DevOps & SRE', emoji: '⚙️' },
  { id: 'digital_marketing', label: 'Digital Marketing', emoji: '📣' },
  { id: 'networking', label: 'Networking', emoji: '🌐' },
  { id: 'it_support', label: 'IT Support', emoji: '🛠️' },
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to tech or just starting out', emoji: '🌱' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Have some experience, want to grow', emoji: '🌿' },
  { id: 'advanced', label: 'Advanced', desc: 'Professional looking to specialise', emoji: '🌳' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ar', label: 'العربية' },
  { code: 'pt', label: 'Português' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OnboardingForm>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: { preferredLanguage: 'en', dataSaverMode: false },
  });

  const skillLevel = watch('skillLevel');

  function toggleGoal(id: string) {
    setSelectedGoals((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 5 ? [...prev, id] : prev;
      setValue('goals', next);
      return next;
    });
  }

  async function onSubmit(data: OnboardingForm) {
    setIsSubmitting(true);
    try {
      await userApi.onboarding({ ...data, goals: selectedGoals });
      navigate('/dashboard');
    } catch {
      // ignore and redirect anyway
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="orb w-72 h-72 bg-brand-500 top-[5%] right-[10%]" />
      <div className="orb w-56 h-56 bg-accent-500 bottom-[10%] left-[5%]" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black">GS</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Personalise your journey</h1>
          <p className="text-muted-foreground">Help us build the perfect roadmap for you</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${i <= step ? 'bg-brand-500' : 'bg-border'}`} />
              <span className="text-xs text-muted-foreground hidden sm:block">{s}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="glass-card rounded-3xl p-8 min-h-[320px] flex flex-col">
            <AnimatePresence mode="wait">
              {/* Step 0: Skill Level */}
              {step === 0 && (
                <motion.div key="step0" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1">
                  <h2 className="font-display text-xl font-bold mb-6">What's your current skill level?</h2>
                  <div className="space-y-3">
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setValue('skillLevel', level.id as OnboardingForm['skillLevel'])}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          skillLevel === level.id
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-border hover:border-border/80 hover:bg-secondary/40'
                        }`}
                      >
                        <span className="text-3xl">{level.emoji}</span>
                        <div>
                          <p className="font-semibold">{level.label}</p>
                          <p className="text-sm text-muted-foreground">{level.desc}</p>
                        </div>
                        {skillLevel === level.id && <CheckCircle size={20} className="ml-auto text-brand-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Goals */}
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1">
                  <h2 className="font-display text-xl font-bold mb-2">What do you want to learn?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select up to 5 goals</p>
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left text-sm ${
                          selectedGoals.includes(goal.id)
                            ? 'border-brand-500 bg-brand-500/10 text-foreground'
                            : 'border-border hover:border-border/70 text-muted-foreground'
                        }`}
                      >
                        <span className="text-xl">{goal.emoji}</span>
                        <span className="font-medium leading-tight">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                  {selectedGoals.length === 0 && <p className="text-xs text-destructive mt-3">Please select at least 1 goal</p>}
                </motion.div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 space-y-5">
                  <h2 className="font-display text-xl font-bold">Where are you based?</h2>
                  <div>
                    <label className="block text-sm font-medium mb-2">Region</label>
                    <select className="input-base" {...register('region')}>
                      <option value="">Select your region…</option>
                      <option value="East Africa">East Africa</option>
                      <option value="West Africa">West Africa</option>
                      <option value="North Africa">North Africa</option>
                      <option value="Southern Africa">Southern Africa</option>
                      <option value="Sub-Saharan Africa">Sub-Saharan Africa</option>
                      <option value="South Asia">South Asia</option>
                      <option value="Southeast Asia">Southeast Asia</option>
                      <option value="Latin America">Latin America</option>
                      <option value="Middle East">Middle East</option>
                      <option value="Europe">Europe</option>
                      <option value="North America">North America</option>
                      <option value="Oceania">Oceania</option>
                      <option value="Global">Global / Other</option>
                    </select>
                    {errors.region && <p className="text-xs text-destructive mt-1">{errors.region.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country (optional)</label>
                    <input type="text" className="input-base" placeholder="e.g. Kenya" {...register('country')} />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 space-y-6">
                  <h2 className="font-display text-xl font-bold">Last few things…</h2>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred language</label>
                    <select className="input-base" {...register('preferredLanguage')}>
                      {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-secondary/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-brand-400" />
                        <p className="font-semibold text-sm">Data Saver Mode</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reduces images and heavy animations. Perfect for slow or metered connections.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                      <input type="checkbox" className="sr-only peer" {...register('dataSaverMode')} />
                      <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-brand-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className={`btn-ghost ${step === 0 ? 'invisible' : ''}`}
              >
                <ChevronLeft size={18} /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 0 && !skillLevel) return;
                    if (step === 1 && selectedGoals.length === 0) return;
                    setStep((s) => s + 1);
                  }}
                  className="btn-primary px-8"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="btn-primary px-8">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Start Learning 🚀'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
