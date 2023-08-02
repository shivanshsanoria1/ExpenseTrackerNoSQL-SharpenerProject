const { Schema, model, SchemaTypes } = require('mongoose');

const downloadedExpenseFileSchema = new Schema({
    fileUrl: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        immutable: true, // cannot be changed
        default: () => new Date()
    },
    userId:{
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = model('DownloadedExpenseFile', downloadedExpenseFileSchema);
