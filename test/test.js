const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

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
  it('should open a file from disc', function() {
    const filename = 'test/sample.csv';
    let fileOpen = false;
    fs.open(filename).then((data) => {
      if (data) {
        fileOpen = true;
      }
    }).catch((error) => {
      console.error(error);
    }).then(() => {
      expect(fileOpen).to.equal(true);
    });
  });
  xit('should transform csv to JSON object', function() {
    // TODO: test reading and converting csv to JSON
  });
})
