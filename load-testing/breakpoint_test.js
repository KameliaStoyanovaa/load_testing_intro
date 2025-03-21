import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 50 },     // Normal load
        { duration: '5m', target: 200 },    // Ramp-up to a high point
        { duration: '5m', target: 500 },    // Ramp-up to a very high point
        { duration: '5m', target: 1000 },   // Ramp-up to an extreme point
        // No ramp-down - test is expected to be stopped when system breaks
    ],
    thresholds: {
        'http_req_duration': ['p(95)<5000'],  // 95% of requests should be below 5000ms
        'http_req_failed': ['rate<0.20'],     // Error rate should be less than 20%
    },
};

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Capitalize endpoint - Focus on one endpoint to find its breaking point
    const capitalizePayload = JSON.stringify({
        name: 'john doe',
        email: 'john.doe@example.com',
    });

    let capitalizeRes = http.post('http://localhost:8080/capitalize', capitalizePayload, params);
    check(capitalizeRes, {
        'capitalize status is 200': (r) => r.status === 200,
    });

    // Very minimal sleep to maximize stress
    sleep(0.1);
}