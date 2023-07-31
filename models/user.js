const { Schema, model } = require('mongoose');

//const Expense = require('./expense');

const expenseSchema = new Schema({
    amount:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        immutable: true, // cannot be changed
        default: () => new Date()
    },
    updatedAt:{
        type: Date,
        default: () => new Date()
    }
});

const userSchema = new Schema({
    username: {
        type: String,
        maxLength: 100,
        required: true
    },
    email: {
        type: String,
        maxLength: 100,
        lowercase: true,
        unique: true, // email should be unique
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => new Date()
    },
    balance: {
        type: Number,
        default: 0,
        required: true
    },
    isPremiumUser: {
        type: Number,
        default: 0, // not a premium user
        required: true
    },
    expenseDetails: [ expenseSchema ]
});

userSchema.methods.getExpensesArray = function(){
    const expenses = this.expenseDetails.map((exp) => {
        return {
            id: exp._id.toString(),
            amount: exp.amount,
            description: exp.description,
            category: exp.category
        };
    });

    return expenses;
}

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