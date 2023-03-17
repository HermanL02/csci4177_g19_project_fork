const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  asset_name: String,
  asset_type: String,
  ticker: String,
  quantity: Number,
  purchase_date: Date,
  purchase_price: Number,
});
const transactionSchema = new mongoose.Schema({
  transaction_type: String,
  asset_name: String,
  asset_type: String,
  ticker: String,
  quantity: Number,
  transaction_date: Date,
  transaction_price: Number,
});

const portfolioSchema = new mongoose.Schema({
  last_update: {
    type: Date,
    default: Date.now,
  },
  owner_id: String,
  profit: {
    type: Number,
    default: 0
  },
  assets: [assetSchema],
  transaction_history: [transactionSchema],
});


module.exports = mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);


