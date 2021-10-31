import mongoose from 'mongoose';
const { Schema } = mongoose;

// NOTE: default applies only if path value is undefined

const reviewsSchema = new Schema({
  product: { type: Number, required: true },
  review_id: { type: Number, required: true },
  rating: { type: Number, required: true },
  summary: { type: String, required: true },
  recommend: { type: Boolean, required: true },
  response: { type: String, default: null },
  body: { type: String, required: true },
  date: { type: Date, required: true },
  reviewer_name: { type: String, required: true },
  helpfulness: { type: Number, default: 0 },
  photos: [{ id: Number, url: String }]
});

const characteristicsSchema = new Schema({
  id: Number,
  product_id: Number,
  name: String
});

const photosSchema = new Schema({
  review_id: { type: Number, required: true },
  url : { type: String, required: true }
});

const charsReviewSchema = new Schema({
  characteristic_id: Number,
  review_id: Number,
  value: Number
});
