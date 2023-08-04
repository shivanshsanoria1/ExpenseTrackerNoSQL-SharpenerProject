const path = require('path');

const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user'); 

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;

exports.getForgotPassword = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'forgotPassword.html'));
}

exports.postForgotPassword = async (req, res) => {
    try{
        const origin = req.headers.origin;
        const ReceiverEmail = req.body.email;

        if(!ReceiverEmail){
            res.status(400).json({ msg: 'Email is required' });
            return;
        }

        const user = await User.findOne({ email: ReceiverEmail });

        if(!user){
            res.status(400).json({ msg: 'Email is not registered' });
            return;
        }

        const payload = {
            email: user.email,
            id: user._id.toString()
        };
        const userSpecific_JWT_SECRET_KEY = process.env.JWT_SECRET_KEY + user.password;
        const token = jwt.sign(payload, userSpecific_JWT_SECRET_KEY, { expiresIn: '15m' });

        const resetLink = `${origin}/password/reset-password/${user._id.toString()}/${token}`;

        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const sender = { email: process.env.SIB_SENDER_EMAIL };
        const receivers = [{ email: user.email }];

        const result = await tranEmailApi.sendTransacEmail({
            sender: sender,
            to: receivers,
            subject: 'Password reset link for Expense Tracker',
            textContent: `
            <a href="${resetLink}" target="_blank">
                Click here to reset password.
            </a>
            
            Only valid for 15 minutes.
            `
        });

        if(!result){
            res.status(500).json({ msg: 'Could not send password reset link' });
            return;
        }
        
        res.status(200).json({ msg: 'Password reset link sent to your email' });
    }catch(err){
        console.log('POST FORGOT PASSWORD ERROR');
        //console.log(err);
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}

exports.getResetPassword = async (req, res) => {
    try{
        const { userId, token } = req.params;
        if(!userId || !token){
            res.status(400).json({ msg: 'something went wrong :(' });
            return;
        }

        const user = await User.findById(userId);
        if(!user){
            res.status(400).json({ msg: 'User not registered' });
            return;
        }

        const userSpecific_JWT_SECRET_KEY = process.env.JWT_SECRET_KEY + user.password;
        const payload = jwt.verify(token, userSpecific_JWT_SECRET_KEY);

        res.sendFile(path.join(__dirname, '..', 'views', 'resetPassword.html'));
    }catch(err){
        console.log('GET RESET PASSWORD ERROR');
        //console.log(err);
        if(err.name === 'TokenExpiredError'){
            res.status(500).json({error: err, msg:'Please generate a new password reset link.'});
            return;
        }
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}

exports.postResetPassword = async (req, res) => {
    try{
        const { userId, token } = req.body;
        if(!userId || !token){
            res.status(400).json({ msg: 'something went wrong :(' });
            return;
        }
        const newPassword = req.body.password;
        if(!newPassword){
            res.status(400).json({ msg: 'Password is required' });
            return;
        }

        const user = await User.findById(userId);
        if(!user){
            res.status(400).json({ msg: 'User is not registered' });
            return;
        }

        const userSpecific_JWT_SECRET_KEY = process.env.JWT_SECRET_KEY + user.password;
        const payload = jwt.verify(token, userSpecific_JWT_SECRET_KEY);

        const hash = await bcrypt.hash(newPassword, 10); // 10 salt rounds
        user.password = hash;
        await user.save();

        res.status(201).json({msg: 'Password updated successfuly'});
    }catch(err){
        console.log('GET RESET PASSWORD ERROR');
        //console.log(err);
        if(err.name === 'TokenExpiredError'){
            res.status(500).json({error: err, msg:'Please generate a new password reset link.'});
            return;
        }
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}