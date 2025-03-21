import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 50 },  // Ramp-up to 50 users over 2 minutes
        { duration: '5m', target: 50 },  // Stay at 50 users for 5 minutes
        { duration: '2m', target: 0 },   // Ramp-down to 0 users over 2 minutes
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1000ms
    },
};

export default function () {
    // Test all endpoints as in the smoke test
    let homeRes = http.get('http://localhost:8080/');
    check(homeRes, {
        'homepage status is 200': (r) => r.status === 200,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

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

    // Add random sleep between 1-3 seconds to simulate real user behavior
    sleep(Math.random() * 2 + 1);
}