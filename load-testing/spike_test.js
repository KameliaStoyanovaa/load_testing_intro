import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 10 },    // Baseline
        { duration: '30s', target: 200 },  // Spike to 200 users quickly
        { duration: '1m', target: 200 },   // Stay at spike level for 1 minute
        { duration: '30s', target: 10 },   // Quickly ramp down
        { duration: '1m', target: 10 },    // Back to baseline
    ],
    thresholds: {
        'http_req_duration': ['p(95)<3000'], // 95% of requests should be below 3000ms
        'http_req_failed': ['rate<0.10'],   // Error rate should be less than 10%
    },
};

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Login endpoint - Focus on a single endpoint to create more concentrated spike
    const loginPayload = JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
    });

    let loginRes = http.post('http://localhost:8080/login', loginPayload, params);
    check(loginRes, {
        'login status is 200': (r) => r.status === 200,
    });

    // Capitalize endpoint
    const capitalizePayload = JSON.stringify({
        name: 'john doe',
        email: 'john.doe@example.com',
    });

    let capitalizeRes = http.post('http://localhost:8080/capitalize', capitalizePayload, params);
    check(capitalizeRes, {
        'capitalize status is 200': (r) => r.status === 200,
    });

    // Minimal sleep during spike to maximize stress
    sleep(0.3);
}