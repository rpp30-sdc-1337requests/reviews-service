const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const { reviewsSchema, charsReviewSchema, photosSchema, maxIdSchema } = require('./schemas.js');

mongoose.connect('mongodb://localhost:27017/reviews_service?maxPoolSize=1000');

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'conection error: '));

// store max ids for data insertion
let MaxIds = mongoose.model('MaxIds', maxIdSchema, 'max_ids' );

let max_id_query = {};
let max_ids = {
  "review_id": null,
  "chars_review_id": null,
  "photo_id": null
};

// helper function to query a specific collection
const findInCollection = (name, query, cb) => {
  let collection = mongoose.connection.collection(name);
  collection.find(query).toArray(cb);
};

// notify when database connection succeeds
connection.once('open', function () {
  console.log('Connected to Database');
  // load max ids on db start
  findInCollection('max_ids', {}, (err, data) => {
    if (err) {
      console.log('Error loading max ids');
    } else {
      max_id_query = { _id: data[0]._id };
      max_ids.review_id = data[0].review_id;
      max_ids.chars_review_id = data[0].chars_review_id;
      max_ids.photo_id = data[0].photo_id;
    }
  });
});

// query tests


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
    }).catch(err => {
      cb(err);
    });
}

let reviewsQuery = (id) => {
  return [
    { $match:
      { product_id: id, reported: false }
    },
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

// ratings by star, recommended counts, characteristics
let ratingQuery = (idIn) => {
  return [
    { $match: {
        $expr: { $eq: [ "$product_id", idIn ] }
      }
    },
    { $project: { _id: 0, rating: 1 } },
    { $group: {
        _id: '$rating',
        count: {
          $count: {}
        }
      }
    },
    { $sort: { id: 1 } }
  ]
};

let recommendQuery = (idIn) => {
  return [
    { $match: {
        $expr: { $eq: [ "$product_id", idIn ] }
      }
    },
    { $project: { _id: 0, recommend: 1 } },
    { $group: {
        _id: { $toInt: '$recommend' },
        ratings: {
          $count: {}
        }
      }
    },
    { $sort: { id: 1 } }
  ]
};

let charsQuery = (idIn) => {
  return [
    { $match: {
        $expr: { $eq: [ "$product_id", idIn ] }
      }
    },
    { $lookup: {
        from: 'characteristic_reviews',
        localField: 'id',
        foreignField: 'characteristic_id',
        pipeline: [
          { $project: {
            _id: 0,
            'id': '$characteristic_id',
            value: 1
          }},
          { $group: {
            _id: '$id',
            value: { $avg: '$value' }
          }}],
        as: 'characteristics'
      }
    }
  ];
};

module.exports.getMetadata = (id, callback) => {
  let result = {
    product_id: id.toString(),
    ratings: {},
    recommend: {},
    characteristics: {}
  };
  let coll = 'reviews';
  let ratingMeta = [];
  let recommendMeta = [];
  let charsMeta = [];

  // query callback heck
  aggregateCollection(coll, ratingQuery(id), (err, data) => {
    if (err) {
      callback(err);
    } else {
      ratingMeta = data;
      aggregateCollection(coll, recommendQuery(id), (err, data) => {
        if (err) {
          callback(err);
        } else {
          recommendMeta = data;
          coll = 'characteristics';
          aggregateCollection(coll, charsQuery(id), (err, data) => {
            if (err) {
              callback(err);
            } else {
              charsMeta = data;
              ratingMeta.forEach( obj => {
                result.ratings[obj._id] = obj.count;
              });
              recommendMeta.forEach( obj => {
                result.recommend[obj._id] = obj.ratings;
              });
              charsMeta.forEach( obj => {
                result.characteristics[obj.name] = {
                  'id': obj.characteristics[0]._id,
                  'value': obj.characteristics[0].value.toLocaleString(undefined, {minimumFractionDigits: 4})
                }
              });
              callback(null, result);
            }
          });
        }
      });
    }
  });
};

const Review = mongoose.model('Review', reviewsSchema, 'reviews');
const Photo = mongoose.model('Photo', photosSchema, 'reviews_photos');
const Characteristic = mongoose.model('Characteristic', charsReviewSchema, 'characteristic_reviews');

module.exports.addReview = (data, cb) => {
  let reviewData = {
    id: max_ids.review_id + 1,
    product_id: data.product_id,
    rating: data.rating,
    date: Date.now(),
    summary: data.summary,
    body: data.body,
    recommend: data.recommend,
    reported: false,
    reviewer_name: data.name,
    reviewer_email: data.email,
    response: null,
    helpfulness: 0
  };

  let photoData = [];
  if (data.photos.length > 0) {
    // setup photo objects for insert
    data.photos.forEach( photo => {
      photoData.push({
        id: max_ids.photo_id + 1,
        review_id: max_ids.review_id + 1,
        url: photo
      });
      max_ids.photo_id++;
    });
  }

  let charReviewData = [];
  for (const key in data.characteristics) {
    charReviewData.push({
      id: max_ids.chars_review_id + 1,
      characteristic_id: key,
      review_id: max_ids.review_id + 1,
      value: data.characteristics[key]
    });
    max_ids.chars_review_id++;
  }

  Review.insert(reviewData)
    .then(() => {
      max_ids.review_id++;
      return;
    }).catch((err) => {
      console.error.bind(console, 'Error inserting review data: ' + err);
      cb(err);
    }).then(() => {

      let size = photoData.length;
      if (size > 0) {
        Photo.insertMany(photoData)
          .then(() => {
            return;
          }).catch((err) => {
            console.error.bind(console, 'Error inserting photo data: ' + err);
            max_ids.photo_id -= photoData.length;
            cb(err);
          });
      }
    }).then(() => {

      size = charReviewData.length;
      if (size > 0) {
        Characteristic.insertMany(charReviewData)
          .then(() => {
            return;
          }).catch((err) => {
            console.error.bind(console, 'Error inserting characteristic data: ' + err);
            max_ids.chars_review_id -= charReviewData.length;
            cb(err);
          });
      }
    }).then(() => {

      MaxIds.findOneAndUpdate(max_id_query, max_ids)
        .then(() => {
          console.log('Review Data Insert Success');
          cb(null, true);
        }).catch((err) => {
          console.error.bind(console, 'Error updating max_ids: ' + err);
          cb(err);
        });
    });
}
  // review post req.body:  {
  //   product_id: 47425,
  //   rating: 2,
  //   summary: 'r',
  //   body: 'reasdfawefaaaaaaaaaaaaaaaaawefasdfawefasdfafefefefe',
  //   recommend: false,
  //   name: 'e',
  //   email: 'eeee@eff.eee',
  //   photos: [],
  //   characteristics: { '159172': 2, '159173': 2, '159174': 2, '159175': 2 }
  // }
