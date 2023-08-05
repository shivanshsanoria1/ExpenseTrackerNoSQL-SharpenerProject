const User = require('../models/user');
const DownloadedExpenseFile = require('../models/downloadedExpenseFile');
const S3Services = require('../services/s3');
const { csvMaker } = require('../helpers/csvMaker');

exports.getLeaderboard = async (req, res) => {
    const users = await User.find()
    .select('username balance -_id') // select username, balance and remove _id fields
    .sort({ balance: -1 }) // sort in decreasing order of balance
    .limit(5); // limit the number of users to 5

    res.status(200).json(users);
}

exports.getDownloadExpenses = async (req, res) => {
    try{
        const user = req.user;

        const expenses = user.expenseDetails.map((exp) => {
            return {
                AMOUNT: exp.amount,
                DESCRIPTION: exp.description,
                CATEGORY: exp.category,
                CREATED_AT: exp.createdAt,
                UPDATED_AT: exp.updatedAt
            };
        });

        const filename = `Expenses_${user._id.toString()}_${new Date()}.csv`;
        const fileUrl = await S3Services.uploadToS3(csvMaker(expenses), filename);

        const expenseFile = new DownloadedExpenseFile({
            fileUrl: fileUrl,
            userId: user._id
        });
        await expenseFile.save();

        res.status(200).json(fileUrl);
    }catch(err){
        console.log('GET DOWNLOAD EXPENSES ERROR');
        console.log(err);
        res.status(500).json({error: err, msg: 'Could not get download link'});
    }
}

exports.getDownloadExpenseFileHistory = async (req, res) => {
    try{
        const user = req.user;

        const expenseFileList = await DownloadedExpenseFile.find({ userId: user._id.toString()})
        .select('fileUrl createdAt -_id') // select fileUrl, createdAt and remove _id fields
        .sort({ createdAt: -1 }) // sort in decreasing order of date, ie, latest date first
        .limit(10);

        res.status(200).json(expenseFileList);
    }catch(err){
        console.log('GET DOWNLOADED EXPENSE FILE HISTORY ERROR');
        //console.log(err);
        res.status(500).json({error: err, msg: 'Could not get download expense file history'});
    }
}