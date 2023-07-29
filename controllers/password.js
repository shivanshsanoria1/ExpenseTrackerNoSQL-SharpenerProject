require('dotenv').config();

const path = require('path');

const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const ForgotPassword = require('../models/forgotPassword');
const sequelize = require('../util/database'); 

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;

exports.getForgotPassword = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'forgotPassword.html'));
}

exports.postForgotPassword = async (req, res) => {
    const host = req.headers.origin;
    const ReceiverEmail = req.body.email;
    if(!ReceiverEmail){
        res.status(400).json({msg: 'Email is required'});
        return;
    }

    const t = await sequelize.transaction();

    try{
        const user = await User.findOne({where: {email: ReceiverEmail}});
        if(!user){
            res.status(400).json({msg: 'Email is not registered'});
            return;
        }

        const id = uuid.v4();

        await ForgotPassword.create({
            id,
            isActive: true,
            userId: user.id
        }, {transaction: t});

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = { email: process.env.SIB_SENDER_EMAIL };
        const receivers = [{ email: ReceiverEmail }];

        const result = await tranEmailApi.sendTransacEmail({
            sender: sender,
            to: receivers,
            subject: 'Password reset link',
            htmlContent: `
                <a href="${host}/password/reset-password/${id}" target="_blank">
                    Click here to reset password
                </a>
            `
        }, {transaction: t});
        if(!result){
            res.status(500).json({msg: 'Could not send password reset link'});
            return;
        }
        await t.commit();
        res.status(200).json({msg: 'Password reset link sent to your email'});
    }catch(err){
        console.log('POST FORGOT PASSWORD ERROR');
        await t.rollback();
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}

exports.getResetPassword = async (req, res) => {
    const id = req.params.id;
    try{
        const forgotPassword = await ForgotPassword.findOne({ where: {id} });
        if(!forgotPassword || forgotPassword.isActive === false){
            res.status(400).json({msg: 'id not found or expired'});
            return;
        }
        res.sendFile(path.join(__dirname, '..', 'views', 'resetPassword.html'));
    }catch(err){
        console.log('GET RESET PASSWORD ERROR');
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}

exports.postResetPassword = async (req, res) => {
    const newPassword = req.body.password;
    const id = req.body.link.split('/')[req.body.link.split('/').length-1];
    
    const t = await sequelize.transaction();

    try{
        const forgotPassword = await ForgotPassword.findOne({where: {id}, transaction: t});
        if(!forgotPassword){
            res.status(400).json({msg: 'User not found'});
            return;
        }
        const userId = forgotPassword.userId;

        const user = await User.findOne({where: {id: userId}, transaction: t});

        const hash = await bcrypt.hash(newPassword, 10);

        user.password = hash;
        await user.save();

        forgotPassword.isActive = false;
        await forgotPassword.save();

        await t.commit();
        res.status(201).json({msg: 'Password updated successfuly'});
    }catch(err){
        console.log('GET RESET PASSWORD ERROR');
        await t.rollback();
        res.status(500).json({error: err, msg:'Something went wrong'});
    }
}