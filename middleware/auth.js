const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    User.findById(user.userId)
    .then((user) => {
        req.user = user;
        next();
    })
    .catch((err) => {
        console.log('USER AUTHENTICATION ERRROR');
        //console.log(err);
        res.status(500).json({msg: 'Could not fetch user'});
    });
};

exports.isPremiumUser = (req, res, next) => {
    const token = req.headers.authorization;

    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

    User.findById(user.userId)
    .then((user) => {
        req.user = user;
        if(user.isPremiumUser === 1){
            next();
        }else{
            return res.status(403).json({msg: 'You are not a premium user'});
        }
    })
    .catch((err) => {
        console.log('PREMIUM USER AUTHENTICATION ERRROR');
        //console.log(err);
        res.status(500).json({msg: 'Could not fetch user'});
    });
};