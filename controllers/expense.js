const path = require('path');

const Expense = require('../models/expense');

exports.getAddExpense = (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','expense.html'));
}

exports.postAddExpense = async (req, res) => {
    try{
        const amount = parseInt(req.body.amount);
        const description = req.body.description;
        const category = req.body.category;
        const expenseId = req.body.expenseId;
        const user = req.user;

        if(!amount || !description || !category){
            res.status(400).json({ msg: 'All fields are required' });
            return;
        }
        
        let expense = null;
        let updatedBalance = null;

        if(!expenseId){ // add a new expense
            expense = new Expense({
                amount: amount,
                description: description,
                category: category
            });

            user.expenseDetails.unshift(expense); // push front
            updatedBalance = user.balance + amount;
        }else{ // edit an already existing expense 
            const expenseToEditIndex = user.expenseDetails.findIndex((exp) => exp._id.toString() === expenseId);
            if(expenseToEditIndex === -1){
                res.status(404).json({ msg: 'Item not found' });
                return;
            }
            expense = user.expenseDetails[expenseToEditIndex];
            const amountToEdit = expense.amount;
            expense.amount = amount;
            expense.description = description;
            expense.category = category;
            expense.updatedAt = new Date();
            updatedBalance = user.balance - amountToEdit + amount;
        }
        
        user.balance = updatedBalance;
        await user.save();

        res.status(200).json({
            id: expense._id.toString(),
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt
        });
    }catch(err){
        console.log('POST ADD EXPENSE ERROR');
        //console.log(err);
        res.status(500).json({ error: err, msg: 'Could not add expense' });
    }
}

exports.getAllExpenses = async (req, res) => {
    try{
        const user = req.user;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const expenses = user.getExpensesArray();

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const nextPage = endIndex < expenses.length ? page + 1 : null;
        const prevPage = startIndex > 0 ? page - 1 : null;

        res.status(200).json({
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            limit,
            expenses: expenses.slice(startIndex, endIndex),
            balance: user.balance
        });
    }catch(err){
        console.log('GET ALL EXPENSES ERROR');
        //console.log(err);
        res.status(500).json({ error: err, msg: 'Could not fetch expenses'});
    }
}

exports.deleteDeleteExpense = async (req, res) => {
    try{
        const expenseId = req.params.expenseId;
        const user = req.user;

        const expenseToDeleteIndex = user.expenseDetails.findIndex((exp) => exp._id.toString() === expenseId);
        if(expenseToDeleteIndex === -1){
            res.status(404).json({ msg: 'Item not found' });
            return;
        }
        const amountToDelete = user.expenseDetails[expenseToDeleteIndex].amount;
        const updatedExpenses = user.expenseDetails.filter((exp) => exp._id.toString() !== expenseId);
        user.expenseDetails = updatedExpenses;
        user.balance -= amountToDelete;
        await user.save();
        res.status(200).json({ amount: amountToDelete }); 
    }catch(err){
        console.log('POST DELETE EXPENSE ERROR');
        //console.log(err);
        res.status(500).json({ error: err, msg: 'Could not delete expense' });
    }
};

exports.getEditExpense = async (req, res) => {
    try{
        const expenseId = req.params.expenseId;
        const user = req.user;

        const expenseToEditIndex = user.expenseDetails.findIndex((exp) => exp._id.toString() === expenseId);
        if(expenseToEditIndex === -1){
            res.status(404).json({ msg: 'Item not found' });
            return;
        }
        const expense = user.expenseDetails[expenseToEditIndex];
        res.status(200).json({
            id: expense._id.toString(),
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt
        });
    }catch(err){
        console.log('GET EDIT EXPENSE ERROR');
        //console.log(err);
        res.status(500).json({ error: err, msg: 'Could not get expense info' });
    }
}