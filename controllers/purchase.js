const Razorpay = require('razorpay');

const Order = require('../models/order');
const { generateAccessToken } = require('../helpers/jwtHelper');

exports.purchasePremium = async (req, res) => {
    try{
        const user = req.user;

        const rzp = new Razorpay({ 
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    
        const amount = 2500; // amount is in paise and not rupees
        const rzpOrder = await rzp.orders.create({ amount: amount, currency:'INR' });

        const orderObj = new Order({
            status: 'PENDING',
            orderId: rzpOrder.id,
            userId: user._id
        });
        await orderObj.save();

        res.status(201).json({ order: rzpOrder, key_id: rzp.key_id });
    }catch(err){
        console.log('PURCHASE PREMIUM ERROR');
        //console.log(err);
        res.status(403).json({error: err, msg: 'something went wrong'});
    }
}

exports.updateTransactionStatus = async (req, res) => {
    const { payment_id, order_id, status } = req.body;
    const user = req.user;
    
    try{
        // change the order status from PENDING to SUCCESSFUL / FAILED
        if(status === 'success'){
            await Order.findOneAndUpdate({ orderId: order_id }, {
                paymentId: payment_id,
                status: 'SUCCESSFUL',
                updatedAt: new Date()
            });

            // make the user a premium user
            user.isPremiumUser = 1;
            await user.save();

            return res.status(200).json({
                success: true,
                msg: 'Transaction Successful', 
                token: generateAccessToken(user)
            });

        }else{
            await Order.findOneAndUpdate({ orderId: order_id }, {
                status: 'FAILED',
                updatedAt: new Date()
            });

            return res.status(200).json({success: false, msg: 'Transaction Failed'});
        }
    }catch(err){
        console.log('UPDATE TRANSACTION STATUS ERROR');
        //console.log(err);
        res.status(403).json({error: err, msg: 'something went wrong'});
    }
}