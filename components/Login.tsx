import React, { useState } from 'react';
import { useStore } from '../services/store';
import { UserRole } from '../types';
import { Eye, EyeOff, ShoppingBag, UserCircle, ShieldCheck, Briefcase } from 'lucide-react';

export const Login: React.FC<{ onGuest: () => void }> = ({ onGuest }) => {
  const { login, register, users } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!companyName || !email || !password) {
        setError("All fields are required");
        return;
      }
      register(companyName, email, password);
    } else {
      // Check for exact match on "email" field (which now acts as username/email)
      const user = users.find(u => u.email === email && u.password === password && u.role === role);
      if (user) {
        login(user);
      } else {
        setError("Invalid credentials");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50">
            <ShoppingBag size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-white">
            NovaOrder
          </h1>
          <p className="text-slate-300 mt-2">B2B Wholesale Platform</p>
        </div>

        {/* Role Selection Tabs */}
        {mode === 'login' && (
          <div className="flex p-1 bg-slate-800/50 rounded-lg mb-6">
            <button
              onClick={() => setRole(UserRole.CLIENT)}
              className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all ${role === UserRole.CLIENT ? 'bg-indigo-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <UserCircle size={18} className="mr-2" /> Client
            </button>
            <button
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all ${role === UserRole.ADMIN ? 'bg-rose-600 shadow-lg text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <ShieldCheck size={18} className="mr-2" /> Admin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-400 transition-colors placeholder-slate-500"
              />
            </div>
          )}

          <div className="relative">
            <UserCircle className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder={mode === 'login' ? "Email or Username" : "Email Address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-400 transition-colors placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-3 text-slate-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-400 transition-colors placeholder-slate-500"
            />
          </div>

          {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-[1.02]">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <button onClick={onGuest} className="hover:text-indigo-300 underline">
            Browse as Guest
          </button>
          {role !== UserRole.ADMIN && (
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="hover:text-indigo-300">
              {mode === 'login' ? 'Need an account?' : 'Back to Login'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};