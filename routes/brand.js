const { Brand } = require('../models/brand');
const express = require('express');
const router = express.Router();

// add new brand
router.post('/',async (req, res) => {
    let brand = new Brand({
        name: req.body.name
    });
    
    brand = await brand.save();

    if (brand) {
        return res.status(200).json({ success: true, message: "Tạo hãng thành công!",data:brand });
    } else {
        return res.status(500).json({ success: false, message: "Không thể tạo dữ liệu hãng!" });
    }
});

// get all brand
router.get(`/`, async (req, res) => {
    const brandList = await Brand.find();

    if (!brandList) {
        res.status(500).json({ success: false })
    }
    res.send(brandList);
})

// get all price
router.get(`/priceList`, async (req, res) => {
    const priceList = [
        {
            "from":0,
            "to":2000000
        },
        {
            "from":2000000,
            "to":4000000
        },
        {
            "from":4000000,
            "to":8000000
        },
        {
            "from":8000000,
            "to":12000000
        }
    ];

    if (!priceList) {
        res.status(500).json({ success: false })
    }
    res.send(priceList);
})



module.exports = router;