const express = require('express');
const app = express();
const bodyparser = require('body-parser');
// TODO: import DB methods here
const db = require('../database/database.js');

const port = 1337;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// reviews route for specific product
// params: page, count, sort, product_id
app.get('/reviews', (req, res) => {
  console.log('GET /reviews');
  let product_id = parseInt(req.query.product_id);
  console.log('req product_id: ', product_id);
  let page = parseInt(req.query.page) || 0;
  let count = parseInt(req.query.count)  || 5;
  // sort options: newest, helpful, relevant
  let sort = req.query.sort || 'newest';

  let response = {
    'product': product_id,
    'page': page,
    'count': count,
    'results': []
  };

  db.getReviews(product_id, (err, data) => {
    if(err) {
      console.error('Error retrieving review: ', err);
    } else {
      console.log('server data: ', data);
      response.results = data;
      console.log('Response object: ', response);
      res.send(response);
    }
  });

});

// reviews meta route for product
// params: product_id
app.get('/reviews/meta', (req, res) => {
  let product_id = parseInt(req.query.product_id);

  db.getMetadata(product_id, (err, data) => {
    if(err) {
      console.error('Error retrieving metadata: ', err);
    } else {
      res.status(200);
      res.send(data);
    }
  })
});

// reviews post route for new review on product
// params: product_id, rating, summary, body, recommend
//         name, email, photos, characteristics
app.post('/reviews', (req, res) => {
  db.addReview(req.body, (err, success) => {
    if (err) {
      res.status(400).send(err);
    } else if (success) {
      res.status(201).end();
    }
  });
});

// reviews route to mark review as helpful
// params: review_id
app.put('/reviews/*/helpful', (req, res) => {
  console.log('helpful params: ', req.params);
  let reviewId = parseInt(req.params[0]);
  db.markHelpful(reviewId, (err, response) => {
    if (err) {
      res.status(500).end();
    } else {
      res.status(200).end();
    }
  })
});

// reviews route to report a review
// params: review_id
app.put('/reviews/*/report', (req, res) => {
  console.log('report params: ', req.params);
  let reviewId = parseInt(req.params[0]);
  db.reportReview(reviewId, (err, response) => {
    if (err) {
      res.status(500).end();
    } else {
      res.status(200).end();
    }
  })
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; // required for testing
