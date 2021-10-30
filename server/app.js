const express = require('express');
const app = express();
// TODO: import DB methods here

const port = 1337;

// reviews route for specific product
// params: page, count, sort, product_id
app.get('/reviews', (req, res) => {

});

// reviews meta route for product
// params: product_id
app.get('/reviews/meta', (req, res) => {

});

// reviews post route for new review on product
// params: product_id, rating, summary, body, recommend
//         name, email, photos, characteristics
app.post('/reviews', (req, res) => {

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
