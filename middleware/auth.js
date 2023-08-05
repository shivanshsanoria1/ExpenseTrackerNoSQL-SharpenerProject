const User = require('../models/user');
const { verifyAccessToken } = require('../helpers/jwtHelper');

exports.authenticate = async (req, res, next) => {
    try{
        const token = req.headers.authorization;
        if(!token){
            res.status(400).json({ msg: 'Token required' });
            return;
        }
        
        const decodedToken = await verifyAccessToken(token);

        const user = await User.findById(decodedToken.userId);
        if(!user){
            res.status(400).json({ msg: 'User authentication failed' });
            return;
        }

        req.user = user;
        next();
    }catch(err){
        console.log('USER AUTHENTICATION ERRROR');
        //console.log(err);
        res.status(500).json({msg: 'Could not fetch user'});
    }
};

exports.isPremiumUser = async (req, res, next) => {
    try{
        const token = req.headers.authorization;
        if(!token){
            res.status(400).json({ msg: 'Token required' });
            return;
        }
        
        const decodedToken = await verifyAccessToken(token);

        const user = await User.findById(decodedToken.userId);
        if(!user){
            res.status(400).json({ msg: 'User authentication failed' });
            return;
        }

        req.user = user;
        if(user.isPremiumUser === 1){
            next();
        }else{
            return res.status(403).json({msg: 'You are not a premium user'});
        }
    }catch(err){
        console.log('PREMIUM USER AUTHENTICATION ERRROR');
        //console.log(err);
        res.status(500).json({msg: 'Could not fetch user'});
    }
};