import http from 'k6/http';
import { sleep } from 'k6';

// export const options = {

//   vus: 1000,
//   iterations: 1000000,
//   duration: '60s',
// };

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '90s',
      preAllocatedVUs: 1000,
      maxVUs: 2000
    }
  }
}

export default function () {
  let num = randInRange(1000, 10000);
  http.get(`http://127.0.0.1:1337/reviews?product_id=91${num}`);
}

// returns random int from min to max exclusive
function randInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}