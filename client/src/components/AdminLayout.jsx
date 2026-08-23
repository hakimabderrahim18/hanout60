import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Bell,
  LogOut,
  Store,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import RealTimeToast from './RealTimeToast';
import Logo from './Logo';

const AdminLayout = ({ children, title }) => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'نظرة عامة والتقارير', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'إدارة الأحذية والمخزون', path: '/admin/products', icon: Package },
    { label: 'إدارة الطلبيات والمبيعات', path: '/admin/orders', icon: ShoppingBag },
    { label: 'مركز الإشعارات', path: '/admin/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 font-cairo">
      {/* Toast Alert */}
      <RealTimeToast />

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-slate-200 border-l border-slate-800 shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800">
          <Logo isDark={true} />
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                  active
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions in Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 transition"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>معاينة واجهة المتجر</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {title || 'لوحة التحكم'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime Notification Bell */}
            <NotificationBell />

            {/* Admin Badge */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-slate-800">
                {admin?.username || 'مسؤول المتجر'}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-950 text-white h-full flex flex-col p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <span className="font-extrabold text-lg">حانوت 60</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                        active
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-slate-300"
                >
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>معاينة المتجر</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Child Pages View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
