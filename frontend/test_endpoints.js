

async function testEndpoints() {
    console.log("Starting Endpoint Tests (Frontend -> Backend)");
    const baseUrl = "http://localhost:8080";

    const endpoints = [
        { method: 'GET', url: '/actuator/health' },
        { method: 'GET', url: '/public/jobs' },
        { method: 'GET', url: '/public/mentors' },
        { method: 'GET', url: '/public/sessions' }
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Testing [${ep.method}] ${ep.url}...`);
            const response = await fetch(`${baseUrl}${ep.url}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success! Response Status: ${response.status}`);
            } else {
                console.log(`❌ Failed! Response Status: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Error connecting to ${ep.url}: ${error.message}`);
        }
    }

    // Testing POST Auth
    try {
        console.log(`Testing [POST] /auth/signup...`);
        const user = {
            name: "Test User",
            email: "testuser" + Math.floor(Math.random() * 1000) + "@test.com",
            password: "testpassword",
            role: "ROLE_APPLICANT"
        };

        const response = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            console.log(`✅ Success! User registered. Status: ${response.status}`);
        } else {
            console.log(`❌ Failed! Could not register user. Status: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Error connecting to /auth/signup: ${error.message}`);
    }

    console.log("All tests finished!");
}

testEndpoints();
