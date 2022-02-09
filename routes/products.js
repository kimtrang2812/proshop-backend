const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { Brand } = require("../models/brand");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Định dạng hình ảnh không phù hợp");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(" ").join("-");
    cb(null, `${fileName}`);
  },
});

const uploadOptions = multer({ storage: storage });

// get All product
router.get(`/`, async (req, res) => {
  console.log(req.body);
  console.log("get All product");
  const productList = await Product.find();

  //   const productList = await Product.find();
  //   const brandList = await Brand.find();

  //   let newProductList = [];
  //   for (let i = 0; i < productList.length; i++) {
  //     const product = productList[i];
  //     const element = productList[i].category;
  //     const category = await Category.findById(element);

  //     let obj = {
  //       richDescription: product.richDescription,
  //       image: product.image,
  //       images: product.images,
  //       brand: brandList[i].name,
  //       price: product.price,
  //       rating: product.rating,
  //       numReviews: product.numReviews,
  //       isFeatured: product.isFeatured,
  //       _id: product._id,
  //       name: product.name,
  //       description: product.description,
  //       categoryName: category.name,
  //       categoryId: category._id,
  //       countInStock: product.countInStock,
  //       dateCreated: product.dateCreated,
  //       __v: product.__v,
  //       id: product.id,
  //     };

  //     newProductList.push(obj);
  if (productList) {
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công!",
      data: productList,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Không thể lấy danh sách sản phẩm!" });
  }
});

// get product by multi condition
router.get("/multicondition", async (req, res) => {
  console.log("get Product list by price");
  console.log(req.body);
  let { category, brand, from, to } = req.body;

  let productList = [];

  productList = await Product.find({
    $and: [
      { category: category },
      { brand: brand },
      { price: { $gt: from } },
      { price: { $lt: to } },
    ],
  });

  if (productList) {
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm theo giá thành công!",
      data: productList,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Không thể lấy danh sách sản phẩm!" });
  }
});

// get Product list by category Id
router.get(`/categoryId/:id`, async (req, res) => {
  console.log("get Product list by category Id");
  const productList = await Product.find({ category: req.params.id }).populate(
    "category"
  );
  if (productList) {
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm theo thế loại thành công!",
      data: productList,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Không thể lấy danh sách sản phẩm!" });
  }
});

// get product by Id
router.get(`/:id`, async (req, res) => {
  console.log("get product by Id");
  const product = await Product.findById(req.params.id).populate("category");
  if (product) {
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công!",
      data: product,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Không tìm thấy thông tin sản phẩm!" });
  }
});

// add new Product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  let category = await Category.findById(req.body.category);
  if (!category)
    return res
      .status(400)
      .send({ success: false, message: "Thể loại không đúng!" });

  const file = req.file;
  if (!file)
    return res
      .status(400)
      .send({ success: false, message: "Bạn chưa chọn hình ảnh cho sản phẩm" });

  const fileName = file.filename;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (product) {
    return res.status(200).json({
      success: true,
      message: "Tạo sản phẩm thành công!",
      data: product,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Không thể tạo sản phẩm!" });
  }
});

//update Product
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category)
    return res
      .status(400)
      .send({ success: false, message: "Mã loại sản phẩm không đúng!" });

  console.log("update product api");
  console.log(req.file);

  const file = req.file;
  if (!file)
    return res
      .status(400)
      .send({ success: false, message: "Bạn chưa chọn hình ảnh cho sản phẩm" });

  const fileName = file.filename;

  if (file) {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: fileName,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );
    if (product) {
      return res.status(200).json({
        success: true,
        message: "Cập nhật thông tin sản phẩm thành công!",
        data: product,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật thông tin sản phẩm!",
      });
    }
  } else {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );
    if (product) {
      return res.status(200).json({
        success: true,
        message: "Cập nhật thông tin sản phẩm thành công!",
        data: product,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật thông tin sản phẩm!",
      });
    }
  }
});

// delete product
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Đã xóa sản phẩm" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy mã sản phẩm" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// get product count
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (productCount) {
    return res.status(200).json({
      success: true,
      message: "Lấy số lượng sản phẩm thành công!",
      data: productCount,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Không có sản phẩm!" });
  }
});

// get best seller products by count
router.get(`/get/featured/:count`, async (req, res) => {
  console.log("get best seller products by count");
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (products) {
    return res.status(200).send(products);
  } else {
    return res.status(500).json({ success: false });
  }
});

// put images to server
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .send({ success: false, message: "Mã sản phẩm không hợp lệ" });
    }
    const files = await req.files;
    console.log(files);
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product)
      return res
        .status(500)
        .send({ success: false, message: "Không thể bổ sung hình ảnh!" });

    res.send(product);
  }
);

module.exports = router;
