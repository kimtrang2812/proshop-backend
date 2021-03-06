const { Order } = require('../models/order');
const { OrderItem } = require("..//models/order-item");
const express = require('express');
const authJwt = require('../helpers/jwt');
const router = express.Router();

const app = express();

router.get(`/`, async (req, res) => {
    
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        });

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order);
});

// orders
router.post('/', async (req, res) => {
    
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id
    }));

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    console.log(totalPrice)
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    });
    order = await order.save();

    if (order) {
        return res.status(200).json({ success: true, message: "?????t h??ng th??nh c??ng!", data: order });
    } else {
        return res.status(500).json({ success: false, message: "Kh??ng th??? ?????t h??ng!" });
    }
});

// confirm orders
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    );

    if (order) {
        return res.status(200).json({ success: true, message: "X??c nh???n ????n h??ng th??nh c??ng!", data: order });
    } else {
        return res.status(404).json({ success: false, message: "Kh??ng th??? x??c nh???n ????n h??ng!" });
    }
});

//delete order
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async (order) => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            })
            return res.status(200).json({ success: true, message: "???? x??a s???n ph???m trong gi??? h??ng" });
        } else {
            return res.status(404).json({ success: false, message: "Kh??ng t??m th???y s???n ph???m trong gi??? h??ng" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err });
    });
});

// get total sales
router.get('/get/totalsales',async(req,res)=>{
    const totalSales = await Order.aggregate([
        {$group:{_id:null,totalsales:{$sum:'$totalPrice'}}}
    ]);

    if(!totalSales){
        return res.status(400).json({success:false,message:"Kh??ng th??? t???o ????n h??ng"})
    }

    res.send({totalSales:totalSales.pop().totalsales})
});

// get order count
router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments((count)=>count);

    if (orderCount) {
        return res.status(200).json({ success: true, message: "L???y s??? l?????ng ????n h??ng th??nh c??ng!", data: orderCount });
    } else {
        return res.status(500).json({ success: false, message: "Kh??ng c?? ????n h??ng!" });
    }
})

module.exports = router;