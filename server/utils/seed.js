require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// 20 Selected Shoe Products with realistic Stock & Run-Out Occurrences
const productsData = [
  {
    name: 'حذاء رياضي نايك إير زوم ماكس (Nike Air Zoom Pegasus)',
    description: 'حذاء جري فائق الليونة ومقاوم للصدمات مع بطانة إسفنجية وتهوية ممتازة لأداء رياضي عالي.',
    price: 7800,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'sport',
    brand: 'Nike',
    color: 'أحمر وأسود',
    sizes: [
      { size: '40', quantity: 3 },
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 4 },
      { size: '44', quantity: 1 }, // LOW STOCK
    ],
  },
  {
    name: 'سنيكرز أديداس أوريجينال سوبرستار (Adidas Superstar Classic)',
    description: 'الأيقونة العالمية الكلاسيكية مع خطوط أديداس الثلاثة ونعل مطاطي متين.',
    price: 6400,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'casual',
    brand: 'Adidas',
    color: 'أبيض وخطوط سوداء',
    sizes: [
      { size: '39', quantity: 4 },
      { size: '40', quantity: 7 },
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 5 },
      { size: '43', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'حذاء كلاسيكي رجالي أكسفورد من الجلد الأصلي (Oxford Royal)',
    description: 'حذاء رسمي فاخر من الجلد الطبيعي 100%، خياطة يدوية دقيقة للمناسبات والأعراس والبدلات الرسمية.',
    price: 8500,
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'homme',
    brand: 'Royal Leather',
    color: 'بني عسلي غامق',
    sizes: [
      { size: '40', quantity: 4 },
      { size: '41', quantity: 6 },
      { size: '42', quantity: 8 },
      { size: '43', quantity: 5 },
      { size: '44', quantity: 2 },
    ],
  },
  {
    // TOTAL RUN OUT OF STOCK (isOutOfStock = true)
    name: 'حذاء بوما فلاير رنر للجري (Puma Flyer Runner) - نفد بالكامل',
    description: 'تصميم رياضي عصري خفيف للغاية بتبطين مريح SoftFoam، نفدت كامل الكميات من المحل.',
    price: 5500,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'sport',
    brand: 'Puma',
    color: 'أسود مع لمسات بيضاء',
    sizes: [
      { size: '40', quantity: 0 }, // RUN OUT
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'حذاء نسائي رياضي مريح وخفيف (Nike Air Max Bella)',
    description: 'حذاء رياضي نسائي أنيق للجم والمشي اليومي، خفيف جداً مع نعل فومي مريح.',
    price: 6800,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'femme',
    brand: 'Nike',
    color: 'وردي وأبيض',
    sizes: [
      { size: '36', quantity: 4 },
      { size: '37', quantity: 0 }, // RUN OUT
      { size: '38', quantity: 8 },
      { size: '39', quantity: 0 }, // RUN OUT
      { size: '40', quantity: 2 },
    ],
  },
  {
    name: 'حذاء نيو بالانس 574 الكلاسيكي (New Balance 574)',
    description: 'حذاء كاجوال رياضي عالي الأناقة بنعل ENCAP يوفر راحة ودعماً لا مثيل له طوال اليوم.',
    price: 8200,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'casual',
    brand: 'New Balance',
    color: 'رمادي كلاسيكي',
    sizes: [
      { size: '40', quantity: 5 },
      { size: '41', quantity: 8 },
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 4 },
      { size: '44', quantity: 2 },
    ],
  },
  {
    name: 'بوت تمبرلاند جلدي مقاوم للماء (Timberland 6-Inch Premium)',
    description: 'البوت الشهير عالمياً بجودة خيالية من الجلد النوبوك المقاوم للأمطار والثلوج والصدمات.',
    price: 11500,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'bottines',
    brand: 'Timberland',
    color: 'أصفر جملي كلاسيكي',
    sizes: [
      { size: '40', quantity: 3 },
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 6 },
      { size: '43', quantity: 0 }, // RUN OUT
      { size: '44', quantity: 2 },
      { size: '45', quantity: 1 },
    ],
  },
  {
    name: 'حذاء أطفال رياضي خفيف (Nike Star Runner Kids)',
    description: 'حذاء خفيف وسهل الارتداء بشريط فيلكرو لاصق، نعل متين ومقاوم للعب والصدمات.',
    price: 3600,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'enfant',
    brand: 'Nike Kids',
    color: 'أزرق وبرتقالي',
    sizes: [
      { size: '28', quantity: 4 },
      { size: '29', quantity: 6 },
      { size: '30', quantity: 0 }, // RUN OUT
      { size: '31', quantity: 5 },
      { size: '32', quantity: 4 },
      { size: '33', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'حذاء موكاسين لوفر بدون أربطة (Italian Leather Loafers)',
    description: 'موكاسين رجالي فاخر وسهل الارتداء مصنوع من جلد ناعم ومريح للعمل والتنقل.',
    price: 7200,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'homme',
    brand: 'Clarks Style',
    color: 'هافان / بني فاتح',
    sizes: [
      { size: '40', quantity: 4 },
      { size: '41', quantity: 6 },
      { size: '42', quantity: 8 },
      { size: '43', quantity: 4 },
    ],
  },
  {
    // TOTAL RUN OUT OF STOCK
    name: 'حذاء كعب نسائي أنيق للمناسبات (Elegant High Heels) - نفد من المخزن',
    description: 'كعب متوازن بارتفاع 7 سم للحفلات والأعراس، نفد بالكامل نظراً للإقبال الشديد.',
    price: 7400,
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'femme',
    brand: 'Zara Woman',
    color: 'أسود مطفي',
    sizes: [
      { size: '36', quantity: 0 }, // RUN OUT
      { size: '37', quantity: 0 }, // RUN OUT
      { size: '38', quantity: 0 }, // RUN OUT
      { size: '39', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'صندل رجالي طبي من الجلد الطبيعي (Orthopedic Leather Sandal)',
    description: 'صندل صيفي طبي بفرشة تشريحية تدعم قوس القدم وتخفف آلام الظهر والمفاصل عند الوقوف الطويل.',
    price: 4900,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'sandales',
    brand: 'Medical Comfort',
    color: 'بني داكن',
    sizes: [
      { size: '40', quantity: 5 },
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 9 },
      { size: '43', quantity: 6 },
      { size: '44', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'حذاء نايك إير فورس 1 أبيض ناصع (Nike Air Force 1 White)',
    description: 'حذاء أسطوري بجلد فاخر وتصميم منخفض النعل يمنحك مظهراً راقياً ومريحاً.',
    price: 8900,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'casual',
    brand: 'Nike',
    color: 'أبيض كامل',
    sizes: [
      { size: '39', quantity: 3 },
      { size: '40', quantity: 6 },
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 8 },
      { size: '43', quantity: 5 },
    ],
  },
  {
    name: 'حذاء طبي رجالي مريح لكبار السن (Comfort Care Shoes)',
    description: 'فرشة إسفنجية فائقة النعومة وتصميم واسع يمنع الاحتكاك ويوفر سهولة تامة في الارتداء بشريط فيلكرو.',
    price: 5900,
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'medical',
    brand: 'Dr. Step',
    color: 'أسود مريح',
    sizes: [
      { size: '40', quantity: 4 },
      { size: '41', quantity: 7 },
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 5 },
      { size: '44', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'سنيكرز بناتي لطيف بأضواء LED (Light Up Girl Sneakers)',
    description: 'حذاء بناتي مضيء عند كل خطوة بألوان زاهية ونجوم براقة تسعد الأطفال.',
    price: 3800,
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'enfant',
    brand: 'KidsPower',
    color: 'وردي وباستيل',
    sizes: [
      { size: '26', quantity: 4 },
      { size: '27', quantity: 5 },
      { size: '28', quantity: 0 }, // RUN OUT
      { size: '29', quantity: 5 },
      { size: '30', quantity: 0 }, // RUN OUT
    ],
  },
  {
    name: 'بوت تشيلسي رجالي بدون أربطة (Chelsea Boots Leather)',
    description: 'بوت أنيق وعصري من الجلد الطبيعي مع جوانب مطاطية مرنة لسهولة الارتداء والخلع.',
    price: 8800,
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'bottines',
    brand: 'Zara Man',
    color: 'أسود فحمي',
    sizes: [
      { size: '40', quantity: 4 },
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 7 },
      { size: '43', quantity: 4 },
      { size: '44', quantity: 2 },
    ],
  },
  {
    name: 'كلاكيت أديداس صيفي أصلي (Adidas Adilette Comfort Slides)',
    description: 'كلاكيت صيفي ناعم بنعل Cloudfoam يمنح قدميك استرخاءً تاماً بعد التمارين وعلى الشاطئ.',
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'sandales',
    brand: 'Adidas',
    color: 'أسود مع خطوط بيضاء',
    sizes: [
      { size: '39', quantity: 6 },
      { size: '40', quantity: 8 },
      { size: '41', quantity: 10 },
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 6 },
    ],
  },
  {
    name: 'حذاء سكيشرز غو ووك الرياضي (Skechers Go Walk Air)',
    description: 'وزن خفيف جداً يمنحك شعور المشي على السحاب، سهل الارتداء ومثالي للأنشطة اليومية.',
    price: 6200,
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'sport',
    brand: 'Skechers',
    color: 'رمادي غامق',
    sizes: [
      { size: '39', quantity: 4 },
      { size: '40', quantity: 7 },
      { size: '41', quantity: 8 },
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 4 },
    ],
  },
  {
    name: 'حذاء باليرينا نسائي خفيف بدون كعب (Comfort Ballerinas)',
    description: 'حذاء مسطح مرن وسهل الحمل والاستخدام اليومي للعمل والجامعة والتسوق.',
    price: 3900,
    images: [
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'femme',
    brand: 'Mango Style',
    color: 'بيج نود',
    sizes: [
      { size: '37', quantity: 5 },
      { size: '38', quantity: 8 },
      { size: '39', quantity: 0 }, // RUN OUT
      { size: '40', quantity: 4 },
    ],
  },
  {
    name: 'حذاء سنيكرز نايك دانك لو (Nike Dunk Low Retro)',
    description: 'تصميم الثمانينات الرياضي العصري المفضل لدى الشباب ومحبي الموضة المعاصرة.',
    price: 8600,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'casual',
    brand: 'Nike',
    color: 'باندا (أبيض وأسود)',
    sizes: [
      { size: '40', quantity: 4 },
      { size: '41', quantity: 7 },
      { size: '42', quantity: 0 }, // RUN OUT
      { size: '43', quantity: 6 },
    ],
  },
  {
    // TOTAL RUN OUT OF STOCK
    name: 'حذاء كلاسيكي سويدي محدود (Suede Derby Vintage) - نفد من المخزون',
    description: 'حذاء كلاسيكي أنيق تم بيع كامل النسخ منه بالكامل.',
    price: 7500,
    images: [
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'homme',
    brand: 'Zara Man',
    color: 'كحلي داكن',
    sizes: [
      { size: '40', quantity: 0 }, // RUN OUT
      { size: '41', quantity: 0 }, // RUN OUT
      { size: '42', quantity: 0 }, // RUN OUT
    ],
  },
];

const algerianCustomerNames = [
  'محمد الأمين بلعباس', 'أحمد بن علي', 'كريم مسعودي', 'يوسف قاسم', 'فاطمة الزهراء بوجمعة',
  'سمير عيساوي', 'إسماعيل دراجي', 'حمزة بوعلام', 'سارة بوزيان', 'خالد منصوري',
  'طارق براهيمي', 'بلال فرحات', 'ياسين بلخير', 'مريم سلطاني', 'عبد الرحمن شريف',
  'نبيل مرابط', 'عبد القادر معمر', 'إيمان بلقاسم', 'مراد زروقي', 'أسامة قدور'
];

const algerianWilayasAndCommunes = [
  { wilaya: '14 - تيارت (Tiaret) - مقر المحل', commune: 'تيارت (Tiaret)' },
  { wilaya: '14 - تيارت (Tiaret) - مقر المحل', commune: 'سوق الفلاح (Souk El Fellah)' },
  { wilaya: '14 - تيارت (Tiaret) - مقر المحل', commune: 'فرندة (Frenda)' },
  { wilaya: '14 - تيارت (Tiaret) - مقر المحل', commune: 'السوقر (Sougueur)' },
  { wilaya: '16 - الجزائر العاصمة (Alger)', commune: 'الجزائر الوسطى' },
  { wilaya: '16 - الجزائر العاصمة (Alger)', commune: 'دالي براهيم' },
  { wilaya: '31 - وهران (Oran)', commune: 'وهران' },
  { wilaya: '31 - وهران (Oran)', commune: 'السانية' },
  { wilaya: '25 - قسنطينة (Constantine)', commune: 'قسنطينة' },
  { wilaya: '19 - سطيف (Sétif)', commune: 'العلمة' },
  { wilaya: '09 - البليدة (Blida)', commune: 'بوفاريك' },
  { wilaya: '23 - عنابة (Annaba)', commune: 'عنابة' },
  { wilaya: '13 - تلمسان (Tlemcen)', commune: 'تلمسان' },
  { wilaya: '20 - سعيدة (Saïda)', commune: 'سعيدة' },
  { wilaya: '29 - معسكر (Mascara)', commune: 'معسكر' },
  { wilaya: '27 - مستغانم (Mostaganem)', commune: 'مستغانم' },
  { wilaya: '48 - غليزان (Relizane)', commune: 'غليزان' },
  { wilaya: '17 - الجلفة (Djelfa)', commune: 'الجلفة' },
  { wilaya: '05 - باتنة (Batna)', commune: 'باتنة' },
  { wilaya: '06 - بجاية (Béjaïa)', commune: 'بجاية' },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hanout60';
    console.log(`[Seed] الاتصال بقاعدة البيانات: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // Clear existing collections
    await Admin.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] تم تنظيف البيانات القديمة');

    // 1. Create Default Admin Account
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin25', salt);
    await Admin.create({
      username: 'admin',
      passwordHash,
    });
    console.log('[Seed] ✅ تم إنشاء حساب الأدمن: admin / admin25');

    // 2. Create 20 Shoe Products with out of stock occurrences
    const createdProducts = [];
    let outOfStockProductsCount = 0;
    let outOfStockSizesCount = 0;

    for (const item of productsData) {
      const totalStock = item.sizes.reduce((acc, curr) => acc + curr.quantity, 0);
      const isOutOfStock = totalStock <= 0;

      if (isOutOfStock) outOfStockProductsCount++;
      outOfStockSizesCount += item.sizes.filter((s) => s.quantity === 0).length;

      const p = await Product.create({
        ...item,
        stock: totalStock,
        isOutOfStock,
      });
      createdProducts.push(p);
    }
    console.log(`[Seed] ✅ تم إنشاء ${createdProducts.length} منتج حذاء بنجاح`);
    console.log(`[Seed] ⚠️ حالات نفاد المخزون الكلي (Total Out of Stock): ${outOfStockProductsCount} أحذية`);
    console.log(`[Seed] ⚠️ حالات نفاد المقاسات الفردية (Out of Stock Sizes): ${outOfStockSizesCount} مقاس نفد`);

    // 3. Create 20 Realistic Orders
    const statuses = ['en_attente', 'confirmée', 'en_attente', 'confirmée', 'annulée'];
    const createdOrders = [];

    for (let i = 0; i < 20; i++) {
      const customer = algerianCustomerNames[i % algerianCustomerNames.length];
      const loc = algerianWilayasAndCommunes[i % algerianWilayasAndCommunes.length];
      const status = statuses[i % statuses.length];

      const p1 = createdProducts[i % createdProducts.length];
      const p1Size = p1.sizes?.find((s) => s.quantity > 0)?.size || p1.sizes?.[0]?.size || '41';
      const qty1 = (i % 2) + 1;

      const orderProducts = [
        {
          product: p1._id,
          name: p1.name,
          image: p1.images?.[0] || '',
          size: p1Size,
          quantity: qty1,
          price: p1.price,
        },
      ];

      const totalAmount = orderProducts.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
      const phonePrefix = ['0550', '0661', '0770', '0555', '0668'][i % 5];
      const phoneNumber = `${phonePrefix} ${(10 + i * 3)} ${(20 + i * 2)} ${(30 + i * 4)}`;

      const daysAgo = Math.floor(i / 2);
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const order = await Order.create({
        customerName: customer,
        phoneNumber,
        wilaya: loc.wilaya,
        commune: loc.commune,
        products: orderProducts,
        totalAmount,
        status,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      createdOrders.push(order);
    }
    console.log(`[Seed] ✅ تم إنشاء ${createdOrders.length} طلبية زبائن بنجاح (20 طلبية)`);

    // 4. Create Notifications (including realistic Rupture de stock & Out of Stock alerts)
    const outProducts = createdProducts.filter((p) => p.isOutOfStock);
    const partialOutProducts = createdProducts.filter(
      (p) => !p.isOutOfStock && p.sizes.some((s) => s.quantity === 0)
    );

    for (let i = 0; i < 20; i++) {
      let notifObj;

      if (i % 3 === 0 && outProducts.length > 0) {
        // Critical Total Out of Stock alert
        const prod = outProducts[i % outProducts.length];
        notifObj = {
          type: 'rupture_stock',
          message: `🚨 تنبيه حرج: نفاد المخزون الكلي للحذاء "${prod.name}" بالكامل من المتجر!`,
          relatedProduct: prod._id,
          isRead: i > 6,
          createdAt: new Date(Date.now() - (i * 3) * 3600 * 1000),
        };
      } else if (i % 3 === 1 && partialOutProducts.length > 0) {
        // Specific Size Out of Stock alert
        const prod = partialOutProducts[i % partialOutProducts.length];
        const outSize = prod.sizes.find((s) => s.quantity === 0)?.size || '41';
        notifObj = {
          type: 'rupture_stock',
          message: `⚠️ تنبيه مخزون: نفاد كمية المقاس (${outSize}) للحذاء "${prod.name}" (الكمية المتبقية: 0)`,
          relatedProduct: prod._id,
          isRead: i > 8,
          createdAt: new Date(Date.now() - (i * 4) * 3600 * 1000),
        };
      } else {
        // New order notification
        const order = createdOrders[i % createdOrders.length];
        notifObj = {
          type: 'nouvelle_commande',
          message: `📦 طلب جديد من ${order.customerName} بقيمة ${order.totalAmount.toLocaleString('ar-DZ')} دج (${order.wilaya} - ${order.commune})`,
          relatedOrder: order._id,
          isRead: i > 10,
          createdAt: order.createdAt,
        };
      }

      await Notification.create(notifObj);
    }
    console.log('[Seed] ✅ تم إنشاء 20 إشعار وتنبيه بنجاح (مع تنبيهات نفاد المخزون الكلي والمقاسات)');

    console.log('\n=========================================');
    console.log('🎉 اكتمل توليد كافة البيانات مع حالات نفاد المخزون بنجاح!');
    console.log(`- الأحذية: ${createdProducts.length} منتج`);
    console.log(`- أحذية نفدت بالكامل: ${outOfStockProductsCount} أحذية (تظهر بشارة غير متوفر)`);
    console.log(`- مقاسات نفدت جزئياً: ${outOfStockSizesCount} مقاس`);
    console.log(`- إشعارات نفاد المخزون (Rupture de Stock): مضافة في مركز الإشعارات`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] فشل ملء البيانات:', error);
    process.exit(1);
  }
};

seedData();
