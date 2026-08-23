# 🚀 دليل النشر الكامل: Vercel + Render + MongoDB Atlas

دليل شامل خطوة بخطوة لنشر تطبيق متجر **"hanout60"** مجاناً باحترافية:
- **قاعدة البيانات**: MongoDB Atlas (Cloud)
- **الواجهة الخلفية (Backend + Socket.IO)**: Render.com
- **الواجهة الأمامية (Frontend React Vite)**: Vercel.com

---

## 🗄️ المرحلة 1: إنشاء قاعدة بيانات MongoDB Atlas

1. افتح الموقع: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) وسجل حساباً جديداً.
2. أنشئ **Cluster مجاني (M0 Sandbox)**.
3. **إنشاء المستخدم (Database Access)**:
   - اذهب إلى **Database Access** ➡️ **Add New Database User**.
   - اختر اسم مستخدم: `hanout_admin`
   - اختر كلمة مرور قوية (مثال: `Hanout60Tiaret2026`).
   - الصلاحيات: `Read and write to any database`.
   - اضغط **Add User**.
4. **السماح بالاتصال من أي مكان (Network Access)**:
   - اذهب إلى **Network Access** ➡️ **Add IP Address**.
   - اختر: **Allow Access from Anywhere** (`0.0.0.0/0`).
   - اضغط **Confirm**.
5. **الحصول على رابط الاتصال (Connection String)**:
   - في صفحة **Database Deployments** اضغط على زر **Connect**.
   - اختر **Drivers** (Node.js).
   - انسخ الرابط الذي يظهر لك، وسيكون بهذا الشكل:
     ```
     mongodb+srv://hanout_admin:Hanout60Tiaret2026@cluster0.xxxxx.mongodb.net/hanout60?retryWrites=true&w=majority
     ```
     *(احفظ هذا الرابط، سنستخدمه في Render).*

---

## ⚙️ المرحلة 2: نشر الخادم (Backend) على Render

1. ارفع مجلد المشروع كاملاً إلى مستودع على **GitHub** (مثلاً: `hanout60-store`).
2. افتح موقع: [https://render.com](https://render.com) وسجل الدخول باستخدام GitHub.
3. اضغط على زر **New +** ➡️ **Web Service**.
4. اختر مستودع المشروع `hanout60-store`.
5. قم بملء الحقول كما يلي:
   - **Name**: `hanout60-api` (أو أي اسم تفضله)
   - **Region**: `Frankfurt (EU Central)`
   - **Root Directory**: `server` ⚠️ *(مهم جداً كتابة `server`)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install
     ```
   - **Start Command**:
     ```bash
     node server.js
     ```
   - **Instance Type**: `Free`
6. في قسم **Environment Variables (متغيرات البيئة)** أضف:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `رابط_قاعدة_بيانات_MongoDB_Atlas_الذي_نسخته_في_المرحلة_1`
   - `JWT_SECRET` = `hanout60_super_secret_jwt_key_2026_tiaret`
   - `CLIENT_URL` = `*` (أو رابط Vercel الخاص بك لاحقاً)
7. اضغط **Create Web Service**.
8. انتظر دقيقة حتى يكتمل النشر وتظهر رسالة `Live ✅`.
9. **انسخ رابط الخادم الذي منحه لك Render**، وسيكون مثل:
   ```
   https://hanout60-api.onrender.com
   ```

---

## 🎨 المرحلة 3: نشر الواجهة (Frontend) على Vercel

1. افتح موقع: [https://vercel.com](https://vercel.com) وسجل الدخول بحساب GitHub.
2. اضغط على **Add New...** ➡️ **Project**.
3. اختر مستودع المشروع `hanout60-store`.
4. في صفحة الإعدادات:
   - **Framework Preset**: `Vite`
   - **Root Directory**: اضغط على `Edit` واختر مجلد `client` ⚠️ *(مهم جداً اختيار `client`)*
5. في قسم **Environment Variables (متغيرات البيئة)** أضف:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://hanout60-api.onrender.com` *(رابط Render بدون سلاش في الأخير)*
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://hanout60-api.onrender.com`
6. اضغط **Deploy**.
7. بعد ثوانٍ ستظهر لك شاشة الاحتفال والرابط المباشر للمتجر، مثلاً:
   ```
   https://hanout60.vercel.app
   ```

---

## 🌱 المرحلة 4: ملء البيانات الأولية (Seed) على الخادم السحابي

لملء الـ 20 حذاء وحساب الأدمن في قاعدة بيانات Atlas السحابية:

**الخيار أ (من جهازك مباشرة)**:
عدل ملف `server/.env` وضع رابط `MONGO_URI` السحابي ثم نفذ:
```bash
npm run seed
```

**الخيار ب (من لوحة تحكم Render)**:
- افتح Web Service الخاص بك في Render.
- اذهب إلى **Shell** ونفذ:
```bash
node utils/seed.js
```

---

## 🔐 بيانات دخول لوحة التحكم بعد النشر:
- **الرابط**: `https://your-app.vercel.app/admin/login`
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `admin25`
