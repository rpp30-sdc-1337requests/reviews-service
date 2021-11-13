import http from 'k6/http';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1337,
      timeUnit: '1s',
      duration: '90s',
      preAllocatedVUs: 1337,
      maxVUs: 10000
    }
  }
}

export default function () {
  let num = randInRange(5600000, 5770000);
  http.put(`http://127.0.0.1:1337/reviews/${num}/report`);
}

// returns random int min -> max (exclusive)
function randInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}