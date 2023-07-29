const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('forgotPassword', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    isActive: Sequelize.BOOLEAN
});

module.exports = ForgotPassword;