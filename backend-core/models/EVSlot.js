const mongoose = require('mongoose');

const evSlotSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  hardwareId: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'CHARGING', 'OFFLINE'], default: 'AVAILABLE' },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookingExpiresAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('EVSlot', evSlotSchema);
