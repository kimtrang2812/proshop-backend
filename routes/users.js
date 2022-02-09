const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const mongoose = require("mongoose");

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

router.get(`/`, async (req, res) => {
    // const userList = await User.find().select('name phone email');
    const userList = await User.find().select('-passwordHash');
    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
});

// get user by id
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: 'Không tìm thấy user với id đã gửi lên!' })
    }

    res.status(200).send(user);
})

// register user
router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();
    if (!user) {
        res.status(500).json({ success: false })
    }
    res.send(user);
});

// login user
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).json({ message: 'Người dùng không tồn tại!' })
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                expiresIn: "2h"
            },
            secret
        )
        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            user: user,
            token: token
        });
    } else {
        return res.status(404).json({ message: 'Tên người dùng/mật khẩu đăng nhập không đúng!' });
    }

});

// update user info
router.put('/:id', uploadOptions.single('avatar'), async (req, res) => {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(400).send({ success: false, message: "Người dùng này không tồn tại!" });

    const file = req.file;
    console.log(file)

    let tempName = req.body.name ? req.body.name : user.name;
    let email = req.body.email ? req.body.email : user.email;
    let phone = req.body.phone ? req.body.phone : user.phone;
    let apartment = req.body.apartment ? req.body.apartment : user.apartment

    if (file) {
        const fileName = file.filename;
        const newUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: tempName,
                avatar: fileName,
                email: email,
                phone: phone,
                apartment: apartment
            },
            { new: true }
        );
        if (newUser) {
            return res.status(200).json({ success: true, message: "Cập nhật thông tin cá nhân thành công!", data: newUser });
        } else {
            return res.status(500).json({ success: false, message: "Không thể cập nhật thông tin!" });
        }
    } else {
        const newUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: tempName,
                avatar: user.avatar,
                email: email,
                phone: phone,
                apartment: apartment
            },
            { new: true }
        );
        if (newUser) {
            return res.status(200).json({ success: true, message: "Cập nhật thông tin cá nhân thành công!", data: newUser });
        } else {
            return res.status(500).json({ success: false, message: "Không thể cập nhật thông tin!" });
        }
    }
});


// get user count
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count);

    if (userCount) {
        return res.status(200).json({ success: true, message: "Lấy số lượng người dùng thành công!", data: userCount });
    } else {
        return res.status(500).json({ success: false, message: "Danh sách người dùng rỗng!" });
    }
});

// delete user
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then((user) => {
        if (user) {
            return res.status(200).json({ success: true, message: "Đã xóa người dùng!" });
        } else {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    });
});



module.exports = router;