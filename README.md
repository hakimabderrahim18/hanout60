# تطبيق التجارة الإلكترونية "حانوت 60" (Hanout 60) — MERN Stack

تطبيق متجر إلكتروني متكامل مخصص لبيع الأحذية، مصمم لمتجر **"حانوت 60" (Centre Commercial Souk el Fellah, Tiaret, Algérie)** بواجهة عربية كاملة RTL وتصميم متجاوب وسريع متوافق مع كافة الأجهزة.

---

## 🌟 الميزات الرئيسية

1. **الواجهة العامة (الزبائن والزوار)**:
   - **بدون تسجيل أو إنشاء حساب**: تصفح مباشر وسريع بدون تعقيدات.
   - **استمارة طلب سريع وسلس**: مع قائمة الولايات الـ 58 للجزائر وبلدياتها تلقائياً.
   - **تصفية وبحث متقدم**: تصفية حسب المقاس (Pointure)، الفئة (رجالي، نسائي، رياضي، أطفال)، والبحث بالاسم أو الماركة.
   - **مؤشر التوفر وحالة المخزون**: عرض وسم "غير متوفر" عند نفاد المقاس أو المنتج.
   - **صفحة تأكيد الطلب فورية**.

2. **لوحة تحكم المسؤول (Admin Dashboard)**:
   - **حساب مسؤول محمي بـ JWT**:
     - اسم المستخدم: `admin`
     - كلمة المرور: `admin25`
   - **إدارة المخزون بدقة حسب المقاس**: إضافة وتعديل وحذف الأحذية وتحديد الكمية المتوفرة في كل مقاس (مثلاً مقاس 41: 5 قطع، 42: 8 قطع).
   - **منطق تأكيد الطلبات وخصم المخزون**:
     - عند تقديم الزبون للطلب، تكون الحالة `en_attente` **ولا يتم خصم المخزون**.
     - عند مراجعة المسؤول للطلب والضغط على "تأكيد"، يتم تلقائياً خصم الكمية من مقاس الحذاء المحدد.
     - إذا وصل مخزون المقاس أو الحذاء إلى 0، يتحول المنتج تلقائياً إلى `غير متوفر` وتصل رسالة تنبيه للمسؤول.
     - إمكانية إلغاء الطلب دون المساس بالمخزون.
   - **إشعارات حية في الوقت الفعلي (Real-Time عبر Socket.IO)**:
     - تنبيه فوري عند وصول طلبية جديدة `nouvelle_commande`.
     - تنبيه فوري عند نفاد مخزون أي مقاس أو حذاء `rupture_stock`.
     - جرس إشعارات حي في شريط لوحة التحكم مع عداد غير المقروءة.

---

## 📁 الهيكل البرمجي للمشروع

```
60Store/
├── package.json               # تشغيل الخادم والواجهة معاً
├── README.md
├── server/                    # خادم Node.js & Express (MVC Architecture)
│   ├── .env                   # متغيرات البيئة (MongoDB, JWT)
│   ├── server.js              # نقطة الدخول وتهيئة Express + Socket.IO
│   ├── config/
│   │   └── db.js              # الاتصال بـ MongoDB Mongoose
│   ├── models/
│   │   ├── Admin.js           # نموذج حساب المسؤول
│   │   ├── Product.js         # نموذج الأحذية والمقاسات والمخزون
│   │   ├── Order.js           # نموذج الطلبيات والزبائن
│   │   └── Notification.js    # نموذج الإشعارات
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── notificationController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── notificationRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js  # حماية لوحة التحكم عبر JWT
│   │   ├── uploadMiddleware.js# رفع صور الأحذية بواسطة Multer
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── socket.js          # إدارة اتصالات Socket.IO
│   │   └── seed.js            # سكربت ملء البيانات الأولية والأدمن
│   └── uploads/               # مجلد الصور المرفوعة
│
└── client/                    # واجهة المستخدم React (Vite + Tailwind CSS RTL)
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html             # خط Cairo + اتجاه RTL
    └── src/
        ├── App.jsx            # التوجيه وحماية المسارات
        ├── context/
        │   ├── AuthContext.jsx   # حالة تسجيل دخول المسؤول
        │   └── SocketContext.jsx # استقبال الإشعارات الحية عبر Socket.IO
        ├── data/
        │   └── algeriaCities.js  # بيانات الـ 58 ولاية والبلديات
        ├── services/
        │   └── api.js            # إعدادات Axios وحقن الـ Token
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   ├── ProductFilter.jsx
        │   ├── OrderModal.jsx
        │   ├── NotificationBell.jsx
        │   ├── AdminLayout.jsx
        │   └── RealTimeToast.jsx
        └── pages/
            ├── HomePage.jsx
            ├── ProductDetailPage.jsx
            ├── OrderSuccessPage.jsx
            └── admin/
                ├── LoginPage.jsx
                ├── DashboardOverview.jsx
                ├── ProductsManagement.jsx
                ├── ProductEditModal.jsx
                ├── OrdersManagement.jsx
                └── NotificationsPage.jsx
```

---

## 🚀 طريقة التثبيت والتشغيل

### 1. المتطلبات الأساسية
- تثبيت **Node.js** (الإصدار 18 أو أحدث).
- تشغيل خادم **MongoDB** محلياً على المنفذ الافتراضي `27017`، أو توفير رابط MongoDB Atlas في ملف `server/.env`.

### 2. تثبيت الحزم (Dependencies)
في المجلد الرئيسي للمشروع، نفذ الأمر التالي لتثبيت جميع الحزم للواجهة والخادم:

```bash
npm run install:all
```

أو يدوياً:
```bash
# تثبيت حزم الجذر
npm install

# تثبيت حزم الخادم
cd server && npm install

# تثبيت حزم الواجهة
cd ../client && npm install
```

### 3. إعداد متغيرات البيئة
تأكد من وجود ملف `server/.env` (تم إنشاؤه افتراضياً):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hanout60
JWT_SECRET=hanout_60_super_secret_jwt_key_2026_tiaret
CLIENT_URL=http://localhost:5173
```

### 4. ملء البيانات التجريبية وحساب الأدمن (Seed Data)
لتوليد تشكيلة أولية من الأحذية وحساب المسؤول تلقائياً:
```bash
npm run seed
```
> سيتم إنشاء حساب الأدمن الافتراضي: `admin` / `admin25`

### 5. تشغيل التطبيق في بيئة التطوير (Dev Mode)
لتشغيل الخادم والواجهة في نفس الوقت بأمر واحد:
```bash
npm run dev
```

- **واجهة المتجر**: `http://localhost:5173`
- **تسجيل دخول الأدمن**: `http://localhost:5173/admin/login`
- **خادم API**: `http://localhost:5000`

---

## 📍 معلومات المتجر
- **الاسم**: حانوت 60 (Hanout 60)
- **الموقع**: المركز التجاري سوق الفلاح، تيارت، الجزائر
- **الهاتف**: 0550 00 60 60
