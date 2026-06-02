import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFamilies } from '../context/FamiliesContext';
import { loadCatalogAssets, type CatalogAsset } from '../lib/catalog';
import { CopyrightFooter } from '../components/layout/CopyrightFooter';

type LoginFormInputs = {
  email: string;
  password: string;
};

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const navigate = useNavigate();
  const { families, loading: familiesLoading } = useFamilies();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormInputs>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function hydrateCatalog() {
      const rows = await loadCatalogAssets();
      if (!cancelled) {
        setAssets(rows);
        setCatalogLoaded(true);
      }
    }

    void hydrateCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = (data: LoginFormInputs) => {
    const emailParts = data.email.split('@')[0].split('.');
    const fullName = emailParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    const initials = emailParts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2) || 'U';

    localStorage.setItem('user', JSON.stringify({
      name: fullName,
      initials: initials,
      email: data.email
    }));

    navigate('/');
  };

  const familyEntries = Object.entries(families);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Section - Branding Area */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative flex w-full flex-col justify-center overflow-hidden bg-[#131e36] p-8 text-white md:w-[55%] md:p-16 lg:w-1/2 lg:p-24"
        >
          {/* Decorative background shapes */}
          <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#1e2f50] opacity-50 blur-3xl mix-blend-screen" />
          <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0a1120] opacity-80 blur-3xl" />
          
          <div className="relative z-10 max-w-xl">
            {/* App brand — unchanged */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-12 flex items-center gap-3"
            >
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white/90">AIMPLIFY</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6 text-4xl font-bold leading-tight lg:text-5xl"
            >
              AI Capabilities & <br /> Accelerator Platform
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-10 max-w-md text-lg leading-relaxed text-blue-100/70 md:mb-14"
            >
              Discover, deploy, and demonstrate InfoVision's AI assets — from prompt libraries and agent patterns to production-ready accelerators.
            </motion.p>

            {/* Platform families — same keys as Home; counts from catalog */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-10"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-blue-200/50">
                Platform families
              </p>
              {familiesLoading && familyEntries.length === 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center rounded-lg bg-white/5 px-2 py-3">
                      <div className="mb-2 h-8 w-10 animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : familyEntries.length === 0 ? (
                <p className="text-sm text-blue-200/60">
                  Family metrics appear when <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">platform_families</code> is configured in Supabase.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-5">
                  {familyEntries.map(([familyId, f]) => {
                    const count = assets.filter((a) => a.family === familyId).length;
                    return (
                      <div
                        key={familyId}
                        className="flex flex-col items-center rounded-lg bg-white/[0.06] px-2 py-3 ring-1 ring-white/10"
                      >
                        <span
                          className="mb-1.5 text-2xl font-bold tabular-nums md:text-3xl"
                          style={{ color: f.color }}
                        >
                          {!catalogLoaded ? '…' : count}
                        </span>
                        <span className="text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-blue-200/55 md:text-xs">
                          {f.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Login Form */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative flex w-full flex-col justify-center bg-white p-8 md:w-[45%] md:p-12 lg:w-1/2 lg:p-24"
        >
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 flex w-full justify-center">
              <img
                src="/infovision_logo.png"
                alt="InfoVision"
                className="h-20 w-auto max-w-[min(100%,420px)] object-contain sm:h-24 md:h-28 lg:h-32"
                width={400}
                height={112}
              />
            </div>
            <div className="mb-10 text-center md:text-left">
              <h2 className="mb-2 text-3xl font-bold text-slate-900">Sign in</h2>
              <p className="text-slate-500">Use your InfoVision credentials</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <div className="group relative">
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    placeholder="you@infovision.com"
                    className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 outline-none focus:ring-2 focus:ring-opacity-20 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                    } bg-slate-50/50 focus:bg-white`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@infovision\.com$/,
                        message: 'Please use your InfoVision company email ID.',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border py-3 pl-4 pr-12 transition-all duration-200 outline-none focus:ring-2 focus:ring-opacity-20 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                    } bg-slate-50/50 focus:bg-white`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={!isValid}
                className={`w-full rounded-xl py-3.5 font-medium text-white shadow-lg transition-all duration-300 ${
                  isValid 
                    ? 'bg-blue-500 shadow-blue-500/25 hover:bg-blue-600 hover:shadow-blue-500/40' 
                    : 'cursor-not-allowed bg-slate-300 shadow-none'
                }`}
              >
                Sign in
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                SSO via Microsoft Entra ID available
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <CopyrightFooter className="shrink-0" />
    </div>
  );
};
