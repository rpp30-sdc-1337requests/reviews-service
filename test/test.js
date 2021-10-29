const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

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
  before( function(done) {
    mongoose.connect('mongodb://localhost:27017/reviewdb', done);
  });
  it('should connect to mongodb through mongoose', function() {
    const CONNECTED = 1;
    expect(mongoose.connection.readyState).to.equal(CONNECTED);
  });
});

describe('Test CSV file operations', function() {

  const filename = 'test/sample.csv';

  it('should open a file from disc', function() {
    let fileOpen = false;
    fs.open(filename, (err, fd) => {
      if (err) {
        console.error('Error opening test file.')
      } else if (fd) {
        fileOpen = true;
      }

      expect(fileOpen).to.equal(true);
    });
  });

  it('should transform csv to JSON object', function() {

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
        expect(testObj).to.deep.equal(expectedObj);
      });
    });

  });

});
