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

//exports.expenseSchema = expenseSchema;
module.exports = model('Expense', expenseSchema);
