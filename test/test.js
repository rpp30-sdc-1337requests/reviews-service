const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const server = require('../server/app.js');
chai.use(chaiHttp);

const mongoose = require('mongoose');

const fs = require('fs');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

function once(func) {
  let result;
  let called = false;
  return function() {
    if (!called) {
      called = true;
      result = func.apply(this, arguments);
    }
    return result;
  }
}

describe('Testing testing', function() {
  it('should run an example test', function() {
    const callback = sinon.fake();
    const proxy = once(callback);

    proxy();
    proxy();

    expect(callback.callCount).to.equal(1);
  });
});

describe('Testing MongoDB connection', function() {
  this.timeout(5000);
  before( function(done) {
    mongoose.connect('mongodb://localhost:27017/test', done);
  });
  it('should connect to mongodb through mongoose', function() {
    const CONNECTED = 1;
    expect(mongoose.connection.readyState).to.equal(CONNECTED);
  });
});

describe('Test CSV file operations', function() {

  const filename = 'test/sample.csv';

  it('should open a file from disc', function(done) {
    let fileOpen = false;
    fs.open(filename, (err, fd) => {
      if (err) {
        console.error('Error opening test file.')
      } else if (fd) {
        fileOpen = true;
      }

      fs.close(fd, (err) => {
        if(err) {
          console.log('Error closing file');
          done();
        } else {
          expect(fileOpen).to.equal(true);
          done();
        }
      });
    });
  });

  it('should transform csv to JSON object', function(done) {

    let expectedObj = {
      id: '100',
      title: 'A Test Book',
      genre: 'Technology',
      author: 'Raine A.'
    };

    fs.open(filename, (err, fd) => {
      let stream = fs.createReadStream(filename, { fd: fd });
      let rl = readline.createInterface({ input: stream, terminal: false });

      let testObj = {};
      let keys = [];
      let values = [];
      let firstLine = true;
      rl.on('line', line => {
        if (firstLine) {
          keys = line.split(',');
          firstLine = false;
        } else {
          values = line.split(',');
          for (let i = 0; i < keys.length; i++) {
            testObj[keys[i]] = values[i];
          }
        }
      });
      stream.on('end', () => {
        rl.close();
        expect(testObj).to.deep.equal(expectedObj);
        done();
      });
    });
  });
});

describe('Route GET /reviews', function() {
  it('should return reviews for the given product id', (done) => {
    const product_id = 1;
    chai.request(server)
      .get(`/reviews?product_id=${product_id}`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });
});
