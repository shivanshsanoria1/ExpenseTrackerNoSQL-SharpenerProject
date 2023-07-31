const { Schema, model, SchemaTypes } = require('mongoose');

const orderSchema = new Schema({
    status:{
        type: String,
        default: 'PENDING',
        required: true
    },
    orderId:{
        type: String,
        required: true 
    },
    paymentId:{
        type: String
    },
    createdAt:{
        type: Date,
        immutable: true, // cannot be changed
        default: () => new Date()
    },
    updatedAt:{
        type: Date,
        default: () => new Date()
    },
    userId:{
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = model('Order', orderSchema);
