const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true, // email should be unique
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    isPremiumUser: {
        type: Number,
        required: true
    }
});

module.exports = model('User', userSchema);






/* const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true //email should be unique
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    balance: Sequelize.INTEGER,
    isPremiumUser: Sequelize.BOOLEAN
});

module.exports = User; */