const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const sequelize = require('./util/database');
const homepageRoutes = require('./routes/homepage');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');
const errorController = require('./controllers/error');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgotPassword = require('./models/forgotPassword');
const DownloadedExpenseFile = require('./models/downloadedExpenseFile');

const app = express();

app.use(bodyParser.json({ extended: false } ));
app.use(express.static(path.join(__dirname, 'public')));

app.use(homepageRoutes);
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);
app.use(errorController.get404);

/* User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(DownloadedExpenseFile);
DownloadedExpenseFile.belongsTo(User); */

const mongoDBClusterUser = process.env.mongoDBClusterUser;
const mongoDBClusterPassword = process.env.mongoDBClusterPassword;
const databaseName = 'expenseTrackerNoSQL';

mongoose
.connect(`mongodb+srv://${mongoDBClusterUser}:${mongoDBClusterPassword}@clustertest1.rlecsbt.mongodb.net/${databaseName}?retryWrites=true&w=majority`)
.then(() => {
	console.log('mongodb connected at ' + Date.now());
	app.listen(3000);
})
.catch((err) => console.log(err));