const path = require('path');

const bcrypt = require('bcrypt');

const User = require('../models/user');
const { generateAccessToken } = require('../helpers/jwtHelper');

exports.getSignup = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
};

exports.postSignup = async (req, res) => {
    try{
        const { username, email, password } = req.body;

        if(!username || !email || !password){
            res.status(400).json({ msg: 'All fields are required' });
            return;
        }

        const hash = await bcrypt.hash(password, 10); // 10 salt rounds

        const user = new User({
            username: username,
            email: email,
            password: hash
        });

        await user.save();

        res.status(201).json({ msg: 'User added successfuly' });
    }catch(err){
        console.log('POST USER SIGNIN ERROR');
        //console.log(err);
        // MongoServerError: E11000 duplicate key error collection
        if(err.code === 11000){
            res.status(400).json({ error: err, msg: 'Email is already registered' });
            return;
        }
        res.status(500).json({ error: err, msg: 'Could not add user' });
    }
};

exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
};

exports.postLogin = async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            res.status(400).json({ msg: 'All fields are required' });
            return;
        }

        const user = await User.findOne({ email: email });
        if(!user){
            res.status(404).json({ msg: 'Email not registered' });
            return;
        }
        
        const hash = user.password;
        const match = await bcrypt.compare(password, hash);
        if(!match){
            res.status(401).json({ msg: 'Incorrect Password' });
            return;
        }
        
        res.status(200).json({ 
            msg: 'User logged in successfully', 
            token: await generateAccessToken(user) 
        });
    }catch(err){
        console.log('POST USER LOGIN ERROR');
        //console.log(err);
        res.status(500).json({ error: err, msg: 'Could not fetch user' });
    }
};