const path = require('path');

const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database'); 

exports.getAddExpense = (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','expense.html'));
}

exports.postAddExpense = async (req, res) => {
    const t = await sequelize.transaction();
    
    try{
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;
        const expenseId = req.body.expenseId;
        const userId = req.user.id;

        if(!amount || !description || !category){
            res.status(400).json({ msg: 'All fields are required' });
            return;
        }
        
        let expense = null;
        let updatedBalance = null;
        if(!expenseId){ //add a new expense
            expense = await Expense.create({
                amount: amount,
                description: description,
                category: category,
                userId: userId
            }, { transaction: t });

            updatedBalance = parseInt(req.user.balance) + parseInt(amount);
        }else{ //edit an already existing expense 
            expense = await Expense.findOne({where: {id: expenseId}, transaction: t});
            updatedBalance = parseInt(req.user.balance) - parseInt(expense.amount) + parseInt(amount);
            expense.amount = amount;
            expense.description = description;
            expense.category = category;
            await expense.save();
        }
        
        await User.update({balance: updatedBalance}, {where: {id: userId}, transaction: t});
        
        await t.commit();
        res.status(200).json(expense);
    }catch(err){
        console.log('POST ADD EXPENSE ERROR');
        await t.rollback();
        res.status(500).json({ error: err, msg: 'Could not add expense' });
    }
}

exports.getAllExpenses = async (req, res) => {
    try{
        const user = req.user;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const expenses = await Expense.findAll({ where: {userId: user.id} });
        const userFromDB = await User.findOne({ where: {id: user.id} });

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const nextPage = endIndex < expenses.length ? page + 1 : null;
        const prevPage = startIndex > 0 ? page - 1 : null;

        res.status(200).json({
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            limit,
            expenses: expenses.reverse().slice(startIndex, endIndex),
            balance: userFromDB.balance
        });
    }catch(err){
        console.log('GET ALL EXPENSES ERROR');
        res.status(500).json({ error: err, msg: 'Could not fetch expenses'});
    }
}

exports.deleteDeleteExpense = async (req, res) => {
    const t = await sequelize.transaction();

    try{
        const expenseId = req.params.expenseId;
        const userId = req.user.id;

        const expense = await Expense.findOne({ where: {id: expenseId, userId: userId}, transaction: t });
        if(!expense){
            res.status(404).json({ msg: 'Item not found' });
            return;
        }

        const updatedBalance = parseInt(req.user.balance) - parseInt(expense.amount);

        await User.update({balance: updatedBalance}, {where: {id: userId}, transaction: t});

        expense.destroy();
        await t.commit();
        res.json(expense);
    }catch(err){
        console.log('POST DELETE EXPENSE ERROR');
        await t.rollback();
        res.status(500).json({ error: err, msg: 'Could not delete expense' });
    }
};


exports.getEditExpense = async (req, res) => {
    try{
        const expenseId = req.params.expenseId;
        const expense = await Expense.findOne({where: {id: expenseId}});
        res.status(200).json(expense);
    }catch(err){
        console.log('GET DELETE EXPENSE ERROR');
        res.status(500).json({ error: err, msg: 'Could not get expense info' });
    }
}