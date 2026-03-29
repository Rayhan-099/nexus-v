const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false },
  vehicleType: { type: String, enum: ['ICE', 'EV'], default: 'EV' },
  activeQueueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null },
  activeEVSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'EVSlot', default: null },
  walletBalance: { type: Number, default: 5000 }, // Start with ₹5000 demo credits
  transactions: [{
    type: { type: String, enum: ['TOP_UP', 'WASH_PAYMENT', 'EV_PAYMENT', 'REPAIR_PAYMENT'] },
    amount: { type: Number },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
