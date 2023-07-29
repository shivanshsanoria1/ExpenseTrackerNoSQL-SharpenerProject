const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const DownloadedExpenseFile = sequelize.define('downloadedExpenseFiles', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    fileURL: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = DownloadedExpenseFile;