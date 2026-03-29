const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, enum: ['WASH', 'REPAIR', 'EV_STATION', 'Car Wash Station', 'EV Charging Hub', 'Mechanic Shop'], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  metrics: {
    currentQueueLength: { type: Number, default: 0 },
    avgWaitTimeMins: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
