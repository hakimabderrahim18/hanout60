import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-cairo">
      {/* Glow circles background */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header link to store */}
      <div className="max-w-md w-full mx-auto flex justify-between items-center z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى متجر hanout60</span>
        </Link>
        <span className="text-[11px] text-slate-500">نظام الإدارة الآمن</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Logo & title */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <Logo isDark={true} className="scale-125 my-2" />
            <div>
              <h2 className="text-xl font-black text-white">تسجيل الدخول للمسؤول</h2>
              <p className="text-xs text-slate-400 mt-1">
                إدارة طلبات ومخزون متجر hanout60 (تيارت)
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full pl-3 pr-10 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 transition active:scale-95 text-sm disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-500 z-10">
        متجر حانوت 60 (hanout60) — سوق الفلاح، تيارت &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default LoginPage;
