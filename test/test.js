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
