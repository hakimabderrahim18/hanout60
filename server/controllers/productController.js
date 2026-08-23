const Product = require('../models/Product');
const Notification = require('../models/Notification');
const socketUtils = require('../utils/socket');

// @desc    Get all products (with filters & search)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, size, minPrice, maxPrice, search, inStock, sort } = req.query;

    let query = {};

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Size (matching in sizes array where quantity > 0)
    if (size) {
      query.sizes = {
        $elemMatch: {
          size: size.toString(),
          quantity: { $gt: 0 },
        },
      };
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by Stock status
    if (inStock === 'true') {
      query.isOutOfStock = false;
    }

    // Search by Name, Brand, Description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { color: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'name') sortOptions = { name: 1 };

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const skip = limit ? (page - 1) * limit : 0;

    const total = await Product.countDocuments(query);
    let productsQuery = Product.find(query).sort(sortOptions);

    if (limit) {
      productsQuery = productsQuery.skip(skip).limit(limit);
    }

    const products = await productsQuery;

    res.json({
      success: true,
      total,
      count: products.length,
      page: limit ? page : 1,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, images, category, sizes, color, brand } = req.body;

    let parsedSizes = sizes;
    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = [];
      }
    }

    // Calculate total stock
    const totalStock = Array.isArray(parsedSizes)
      ? parsedSizes.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)
      : 0;

    const product = new Product({
      name,
      description: description || '',
      price: Number(price),
      images: Array.isArray(images) ? images : [],
      category: category || 'homme',
      sizes: Array.isArray(parsedSizes) ? parsedSizes : [],
      color: color || 'عام',
      brand: brand || 'عام',
      stock: totalStock,
      isOutOfStock: totalStock <= 0,
    });

    const createdProduct = await product.save();

    const io = socketUtils.getIO();
    if (io) {
      io.emit('product_changed', { action: 'create', product: createdProduct });
    }

    res.status(201).json({
      success: true,
      message: 'تمت إضافة المنتج بنجاح',
      data: createdProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    const { name, description, price, images, category, sizes, color, brand } = req.body;

    let parsedSizes = sizes;
    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = product.sizes;
      }
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (images !== undefined) product.images = Array.isArray(images) ? images : product.images;
    if (category !== undefined) product.category = category;
    if (color !== undefined) product.color = color;
    if (brand !== undefined) product.brand = brand;

    if (parsedSizes !== undefined && Array.isArray(parsedSizes)) {
      product.sizes = parsedSizes;
      product.stock = parsedSizes.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
      product.isOutOfStock = product.stock <= 0;
    }

    const updatedProduct = await product.save();

    const io = socketUtils.getIO();
    if (io) {
      io.emit('product_changed', { action: 'update', product: updatedProduct });
    }

    res.json({
      success: true,
      message: 'تم تحديث المنتج بنجاح',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    const io = socketUtils.getIO();
    if (io) {
      io.emit('product_changed', { action: 'delete', productId: req.params.id });
    }

    res.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product images
// @route   POST /api/products/upload
// @access  Private (Admin)
exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم تحديد أي صور للرفع',
      });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    res.json({
      success: true,
      message: 'تم رفع الصور بنجاح',
      data: imageUrls,
    });
  } catch (error) {
    next(error);
  }
};
