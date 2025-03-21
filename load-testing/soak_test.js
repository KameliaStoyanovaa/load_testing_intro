import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 50 },    // Ramp-up to target users
        { duration: '18m', target: 50 },   // Stay at target for a long time
        { duration: '2m', target: 0 },     // Ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1000ms
        'http_req_failed': ['rate<0.01'],   // Error rate should be less than 1%
    },
};

export default function () {
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
        'response has capitalized values': (r) => {
            const body = JSON.parse(r.body);
            return body.name === 'JOHN DOE' && body.email === 'JOHN.DOE@EXAMPLE.COM';
        },
    });

    // Add reasonable sleep to simulate real user behavior over long periods
    sleep(Math.random() * 3 + 2);
}