const { Schema, model } = require('mongoose');

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
    createdAt:{
        type: Date,
        immutable: true, // cannot be changed
        default: () => new Date()
    },
    updatedAt:{
        type: Date,
        default: () => new Date()
    }
});

module.exports = model('Expense', expenseSchema);



/* const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Expense = sequelize.define('expenses', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Expense; */