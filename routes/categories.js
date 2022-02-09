const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const multer = require("multer");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Định dạng hình ảnh không phù hợp');
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split(' ').join('-');
        cb(null, `${fileName}`);
    }
})

const uploadOptions = multer({ storage: storage })

// get all category
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.send(categoryList);
})

// get category by id
router.get('/:id',async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({message:'The category with the given ID was not found!'})
    }

    res.status(200).send(category);
})

// add new category
router.post('/', uploadOptions.single('icon'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send({ success: false, message: 'Bạn chưa chọn hình ảnh cho sản phẩm' })

    const fileName = file.filename;

    let category = new Category({
        name: req.body.name,
        icon: `${fileName}`,
        color: req.body.color
    });
    
    category = await category.save();

    if (category) {
        return res.status(200).json({ success: true, message: "Tạo loại sản phẩm thành công!",data:category });
    } else {
        return res.status(500).json({ success: false, message: "Không thể tạo loại sản phẩm!" });
    }
});

// update category
router.put('/:id',async(req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        {
            new:true
        }
    );

    if (category) {
        return res.status(200).json({ success: true, message: "Chỉnh sửa loại sản phẩm thành công!",data:category });
    } else {
        return res.status(404).json({ success: false, message: "Không thể chỉnh sửa loại sản phẩm!" });
    }
})

//delete category by id
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then((category) => {
        if (category) {
            return res.status(200).json({ success: true, message: "Đã xóa loại sản phẩm" });
        } else {
            return res.status(404).json({ success: false, message: "Không tìm thấy loại sản phẩm" })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
})

module.exports = router;