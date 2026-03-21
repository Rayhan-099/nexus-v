const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleType: { type: String, enum: ['ICE', 'EV'], required: true },
  activeQueueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null },
  activeEVSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'EVSlot', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
