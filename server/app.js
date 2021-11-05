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
  console.log('review post req.params: ', req.params);
  console.log('review post req.body: ', req.body);
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
});

// reviews route to mark review as helpful
// params: review_id
app.put('/reviews/*/helpful', (req, res) => {

});

// reviews route to report a review
// params: review_id
app.put('/reviews/*/report', (req, res) => {

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; // required for testing
