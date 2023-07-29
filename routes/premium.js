const express = require('express');

const premiumController = require('../controllers/premium');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/get-leaderboard', userAuthentication.isPremiumUser, premiumController.getLeaderboard);

router.get('/download-expenses', userAuthentication.isPremiumUser, premiumController.getDownloadExpenses);

router.get('/downloaded-expense-file-history', userAuthentication.isPremiumUser, premiumController.getDownloadExpenseFileHistory);

module.exports = router;