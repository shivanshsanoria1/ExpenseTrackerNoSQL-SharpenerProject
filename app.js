const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const homepageRoutes = require('./routes/homepage');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');
const errorController = require('./controllers/error');

const app = express();

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(homepageRoutes);
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);
app.use(errorController.get404);

const mongoDbClusterUser = process.env.MONGODB_CLUSTER_USER;
const mongoDbClusterPassword = process.env.MONGODB_CLUSTER_PASSWORD;
const mongoDbDbName = process.env.MONGODB_DB_NAME;

mongoose
.connect(`mongodb+srv://${mongoDbClusterUser}:${mongoDbClusterPassword}@clustertest1.rlecsbt.mongodb.net/${mongoDbDbName}?retryWrites=true&w=majority`)
.then(() => {
	console.log('mongodb connected at ' + Date.now());
	app.listen(3000);
})
.catch((err) => console.log(err));