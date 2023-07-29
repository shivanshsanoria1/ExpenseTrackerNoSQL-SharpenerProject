const User = require('../models/user');
const Expense = require('../models/expense');
const DownloadedExpenseFile = require('../models/downloadedExpenseFile');
const S3Services = require('../services/s3');

exports.getLeaderboard = async (req, res) => {
    const users = await User.findAll({
        attributes: ['username', 'balance'],
        order: [['balance', 'DESC']]
    });
    res.status(200).json(users.slice(0,5));
}

exports.getDownloadExpenses = async (req, res) => {
    try{
        const user = req.user;
        const userId = user.id;
        const expenses = await Expense.findAll({ where: {userId}});
        const stringifiedExpenses = JSON.stringify(expenses);
        const filename = `Expenses_${userId}_${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);

        await DownloadedExpenseFile.create({
            fileURL,
            userId
        });

        res.status(200).json(fileURL);
    }catch(err){
        console.log('GET DOWNLOAD EXPENSES ERROR');
        res.status(500).json({error: err, msg: 'Could not get download link'});
    }
}

exports.getDownloadExpenseFileHistory = async (req, res) => {
    try{
        const user = req.user;
        const expenseFileList = await DownloadedExpenseFile.findAll({where: {userId: user.id}});
        res.status(200).json(expenseFileList.reverse().slice(0,10));
    }catch(err){
        console.log('GET DOWNLOADED EXPENSE FILE HISTORY ERROR');
        res.status(500).json({error: err, msg: 'Could not get download expense file history'});
    }
}