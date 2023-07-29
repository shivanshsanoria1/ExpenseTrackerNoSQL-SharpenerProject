require('dotenv').config();
const Razorpay = require('razorpay');

const Order = require('../models/order');
const userController = require('./user');

exports.purchasePremium = (req, res) => {
    const rzp = new Razorpay({ 
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const amount = 2500; //amount is in paise and not rupees
    let rzpOrder;
    rzp.orders.create({amount: amount, currency:'INR'})
    .then((order) => {
        rzpOrder = order;
        return req.user.createOrder({orderid: order.id, status: 'PENDING'});
    })
    .then((order) => {
        res.status(201).json({order: rzpOrder, key_id: rzp.key_id});
        return;
    })
    .catch((err) => {console.log(err);
        res.status(403).json({error: err, msg: 'something went wrong'});
    });
}

exports.updateTransactionStatus = async (req, res) => {
    const {payment_id, order_id, status} = req.body;
    const userId = req.user.id;
    const username = req.user.username;
    try{
        const order = await Order.findOne({where: {orderid: order_id}});
        const promise1 = 
            status === 'success' ? 
            order.update({paymentid: payment_id, status: 'SUCCESSFUL'}) : //payment successful
            order.update({status: 'FAILED'}); //payment failed
        const promise2 = 
            status === 'success' ? 
            req.user.update({isPremiumUser: true}) : 
            req.user.update({isPremiumUser: false}) ;
        Promise.all([promise1, promise2])
        .then(() => {
            if(status === 'success'){
                return res.status(200).json({
                    success: true, msg: 'Transaction Successful', 
                    token: userController.generateAccessToken(userId, username, true)
                });
            }else{
                return res.status(200).json({success: false, msg: 'Transaction Failed'});
            }
        })
        .catch((err) => {
            throw new Error(err);
        });
    }catch(err){
        console.log(err);
        res.status(403).json({error: err, msg: 'something went wrong'});
    }
}