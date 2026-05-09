import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import infovisionLogo from '../assets/Infovision_Logo.png';

type LoginFormInputs = {
  email: string;
  password: string;
};

const demoCredentials: LoginFormInputs = {
  email: 'dhanuvanth.senthilkumar@infovision.com',
  password: 'Aimplify@123',
};

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormInputs>({
    mode: 'onChange',
    defaultValues: demoCredentials,
  });

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

  const stats = [
    { label: 'Atlas', value: '3', color: 'text-blue-400' },
    { label: 'Forge', value: '4', color: 'text-amber-400' },
    { label: 'Relay', value: '4', color: 'text-purple-400' },
    { label: 'Sentinel', value: '3', color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Section - Branding Area */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full md:w-[55%] lg:w-1/2 relative bg-[#131e36] text-white flex flex-col justify-center p-8 md:p-16 lg:p-24 overflow-hidden"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1e2f50] opacity-50 blur-3xl mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#0a1120] opacity-80 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          {/* Logo Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/90">AIMPLIFY</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold leading-tight mb-6"
          >
            AI Capabilities & <br /> Accelerator Platform
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-blue-100/70 mb-16 leading-relaxed max-w-md"
          >
            Discover, deploy, and demonstrate InfoVision's AI assets — from prompt libraries and agent patterns to production-ready accelerators.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap gap-10"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className={`text-3xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-sm font-medium tracking-wide text-blue-200/50 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - Login Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full md:w-[45%] lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-24 relative bg-white"
      >
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-500">Use your InfoVision credentials</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="text"
                  inputMode="email"
                  placeholder="you@infovision.com"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                  } bg-slate-50/50 focus:bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-opacity-20`}
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
                  className="text-sm text-red-500 mt-1"
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
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                  } bg-slate-50/50 focus:bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-opacity-20 pr-12`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="text-sm text-red-500 mt-1"
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
              className={`w-full py-3.5 rounded-xl text-white font-medium shadow-lg transition-all duration-300 ${
                isValid 
                  ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25 hover:shadow-blue-500/40' 
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
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

        <div className="absolute bottom-8 w-full flex justify-center items-center gap-2 text-sm text-slate-400">
          <img src={infovisionLogo} alt="InfoVision" className="h-4 opacity-60 grayscale" />
          <span>InfoVision Technology · Internal Platform</span>
        </div>
      </motion.div>
    </div>
  );
};
