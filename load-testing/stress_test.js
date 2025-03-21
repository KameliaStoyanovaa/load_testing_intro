import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 50 },   // Normal load
        { duration: '5m', target: 100 },  // Ramp-up to higher load over 5 minutes
        { duration: '5m', target: 100 },  // Stay at high load
        { duration: '2m', target: 0 },    // Ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<2000'], // 95% of requests should be below 2000ms
        'http_req_failed': ['rate<0.05'],   // Error rate should be less than 5%
    },
};

export default function () {
    // Test the endpoints with minimal delay to increase stress
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Home endpoint
    let homeRes = http.get('http://localhost:8080/');
    check(homeRes, {
        'homepage status is 200': (r) => r.status === 200,
    });

    // Login endpoint
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

    // Shorter sleep to increase request rate
    sleep(Math.random() * 1 + 0.5);
}