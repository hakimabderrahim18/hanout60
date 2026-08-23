import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, MapPin, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner with location & phone */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              المركز التجاري سوق الفلاح، تيارت
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5" />
              خدمة الزبائن: 0550 00 60 60
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3" /> التوصيل متوفر لـ 58 ولاية والدفع عند الاستلام
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="group flex items-center">
            <Logo className="w-11 h-11 sm:w-12 sm:h-12" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                isCurrent('/')
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/?category=homme"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              رجالي
            </Link>
            <Link
              to="/?category=femme"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              نسائي
            </Link>
            <Link
              to="/?category=sport"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              رياضي
            </Link>
            <Link
              to="/?category=enfant"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              أطفال
            </Link>
          </nav>

          {/* Admin or Action Button */}
          <div className="flex items-center gap-2">
            <Link
              to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition border ${
                isAuthenticated
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>{isAuthenticated ? 'لوحة التحكم' : 'دخول الأدمن'}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
