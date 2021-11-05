const mongoose = require('mongoose');
const { Schema } = mongoose;

// NOTE: default applies only if path value is undefined

module.exports.reviewsSchema = new Schema({
  id: { type: Number, required: true },
  product: { type: Number, required: true },
  review_id: { type: Number, required: true },
  rating: { type: Number, required: true },
  summary: { type: String, required: true },
  recommend: { type: Boolean, required: true },
  response: { type: String, default: null },
  body: { type: String, required: true },
  date: { type: Number, required: true },
  reviewer_name: { type: String, required: true },
  helpfulness: { type: Number, default: 0 }
});

module.exports.photosSchema = new Schema({
  id: { type: Number, required: true },
  review_id: { type: Number, required: true },
  url : { type: String, required: true }
});

module.exports.charsReviewSchema = new Schema({
  id: { type: Number, required: true },
  characteristic_id: { type: Number, required: true },
  review_id: { type: Number, required: true },
  value: { type: Number, required: true }
});

module.exports.maxIdSchema = new Schema({
  review_id: Number,
  chars_review_id: Number,
  photo_id: Number
});

// for reference, read only
const characteristicsSchema = new Schema({
  id: Number,
  product_id: Number,
  name: String
});