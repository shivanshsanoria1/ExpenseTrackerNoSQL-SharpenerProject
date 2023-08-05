const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId: user._id.toString(), 
            username: user.username, 
            isPremiumUser: user.isPremiumUser
        };
        jwt.sign(payload, process.env.JWT_SECRET_KEY, (err, token) => {
            if(err){
                console.log(err);
                reject('Cannot generate Access Token');
                return;
            }
            resolve(token);
        });
    });
}

exports.verifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if(err){
                console.log('JWT VERIFICATION ERROR');
                console.log(err);
                reject('JWT verification error');
                return;
            }
            resolve(decodedToken);
        });
    });
}
