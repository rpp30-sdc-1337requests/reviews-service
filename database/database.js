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

// ratings by star, recommended counts, characteristics
let ratingQuery = (idIn) => {
  return [
    {
      $match: {
        $expr: {
          $eq: [
            "$product_id", idIn
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        rating: 1
      }
    },
    {
      $group: {
        _id: '$rating',
        count: {
          $count: {}
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]
};

let recommendQuery = (idIn) => {
  return [
    {
      $match: {
        $expr: {
          $eq: [
            "$product_id", idIn
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        recommend: 1
      }
    },
    {
      $group: {
        _id: { $toInt: '$recommend' },
        ratings: {
          $count: {}
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]
};

let charsQuery = (idIn) => {
  return [
    {
      $match: {
        $expr: {
          $eq: [
            "$product_id", idIn
          ]
        }
      }
    },
    {
      $lookup: {
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
              })
              recommendMeta.forEach( obj => {
                result.recommend[obj._id] = obj.ratings;
              })
              charsMeta.forEach( obj => {
                result.characteristics[obj.name] = {
                  'id': obj.characteristics[0]._id,
                  'value': obj.characteristics[0].value.toLocaleString(undefined, {minimumFractionDigits: 4})
                }
              })
              console.log('ratingMeta: ', ratingMeta);
              console.log('recommendMeta: ', recommendMeta);
              console.log('charsMeta: ', charsMeta);
              console.log('server result: ', result);
              callback(null, result);
            }
          });
        }
      });
    }
  });
};
