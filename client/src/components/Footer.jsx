import React from 'react';
import { ShoppingBag, MapPin, Phone, Clock, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* Advantages row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">توصيل سريع لـ 58 ولاية</h4>
              <p className="text-xs text-slate-400 mt-0.5">الدفع آمن يداً بيد عند استلام الحذاء</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">جودة مضمونة 100%</h4>
              <p className="text-xs text-slate-400 mt-0.5">أحذية ممتازة ومطابقة للصور تماماً</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">إمكانية المعاينة والقياس</h4>
              <p className="text-xs text-slate-400 mt-0.5">جرب مقاسك بكل راحة واطمئنان</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-slate-800/80">
        {/* Col 1: Store info */}
        <div>
          <div className="mb-4">
            <Logo isDark={true} />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            وجهتكم الأولى في ولاية تيارت لاقتناء أرقى وأحدث موديلات الأحذية الرجالية والنسائية والرياضية بأفضل الأسعار وأعلى جودة.
          </p>
          <div className="text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>المركز التجاري سوق الفلاح، ولاية تيارت، الجزائر</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-400 shrink-0" />
              <a href="tel:0550000606" className="hover:text-white transition font-bold" dir="ltr">
                0550 00 06 06
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>مفتوح يومياً من 08:30 صباحاً إلى 20:00 مساءً</span>
            </div>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h3 className="text-white font-bold mb-4 text-base">أقسام المتجر</h3>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link to="/?category=homme" className="hover:text-rose-400 transition">
                أحذية رجالية كلاسيك وكاجوال
              </Link>
            </li>
            <li>
              <Link to="/?category=sport" className="hover:text-rose-400 transition">
                أحذية رياضية وسنيكرز
              </Link>
            </li>
            <li>
              <Link to="/?category=femme" className="hover:text-rose-400 transition">
                أحذية نسائية مريحة وعصرية
              </Link>
            </li>
            <li>
              <Link to="/?category=enfant" className="hover:text-rose-400 transition">
                أحذية أطفال
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Direct Order Info */}
        <div>
          <h3 className="text-white font-bold mb-4 text-base">طريقة الطلب السريع</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            لا حاجة لإنشاء حساب أو كلمة مرور! اختر حذاءك المفضل والمقاس المناسب، املأ معلومات التوصيل البسيطة، وسنقوم بالتواصل معك لتأكيد إرسال الطلبية إلى باب منزلك.
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-rose-300 font-medium">
            ⚡ يتم تجهيز وشحن الطلبات في نفس اليوم!
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <div>
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} — متجر <span className="text-rose-500 font-bold">حانوت 60 (Hanout 60)</span>، تيارت
        </div>
        <div>
          تطوير نظام التجارة الإلكترونية MERN Stack
        </div>
      </div>
    </footer>
  );
};

export default Footer;
