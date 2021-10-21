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
  photos: [{ id: Number, url: String }],
  characteristics: {
    size: { id: Number, value: { type: String, default: "none selected" }},
    width: { id: Number, value: { type: String, default: "none selected" }},
    comfort: { id: Number, value: { type: String, default: "none selected" }},
    quality: { id: Number, value: { type: String, default: "none selected" }},
    length: { id: Number, value: { type: String, default: "none selected" }},
    fit: { id: Number, value: { type: String, default: "none selected" }},
  }
});
