const fs = require('fs');
const readline = require('readline');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/reviews_service?maxPoolSize=1000');

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'conection error:'));

connection.once('open', function () {
  console.log('Connected to Database');
});

// query tests

const findInCollection = (name, query, cb) => {
  let collection = mongoose.connection.collection(name);
  console.log('collection: ', collection);
  collection.find(query).toArray(cb);
}

let coll = 'reviews';
let query = { id: 1 };
let callback = (err, data) => {
  if (err) {
    throw err;
    return;
  }
  console.log('query data:', data);
  return;
};

// findInCollection(coll, query, callback);

const aggregateCollection = (name, query, cb) => {
  let collection = mongoose.connection.collection(name);
  // console.log('collection: ', collection);
  collection.aggregate(query).toArray()
    .then(doc => {
      cb(null, doc);

      return;
    }).catch(err => {
      cb(err);
    });
}

let reviewsQuery = (id) => {
  return [
    { $match:
      { product_id: id }},
    { $project:
      { _id: 0,
        'review_id': '$id',
        rating: 1,
        summary: 1,
        recommend: { $toBool: '$recommend'},
        response: { $cond : { if: { $eq: [ '$response', 'null']}, then: null, else: '$response'}},
        body: 1,
        date: { $toString: { $toDate: '$date'}},
        reviewer_name: 1,
        helpfulness: 1
      }
    },
    { $lookup:
      { from: 'reviews_photos',
        localField: 'review_id',
        foreignField: 'review_id',
        pipeline: [
          { $project: { _id: 0, id: 1, url: 1}}
        ],
        as: 'photos'
      }
    }
  ];
}

module.exports.getReviews = (id, callback) => {
  coll = 'reviews';
  aggregateCollection(coll, reviewsQuery(id), callback);
}






// load file(s)
  // batch data?

// load characteristics to object for comparison transforms

// maybe need to use $lookup to match by review id

const reviewSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  product_id: { type: Number, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, required: true },
  summary: { type: String, required: true },
  body: { type: String, required: true },
  recommend: { type: Boolean, required: true },
  reported: { type: Boolean, required: true },
  reviewer_name: { type: String, required: true },
  reviewer_email: { type: String, required: true },
  response: { type: String, default: null },
  helpfulness: { type: Number, default: 0 }
});

const photoSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  review_id: { type: Number, required: true },
  url : { type: String, required: true }
});
