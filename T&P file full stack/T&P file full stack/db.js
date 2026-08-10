async function requestJson(path, options = {}) {
    const response = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return { ok: false, ...data };
    }

    return { ok: true, ...data };
}

async function saveUser(user) {
    return requestJson('/api/register', {
        method: 'POST',
        body: JSON.stringify(user),
    });
}

async function authenticateUser(email, password) {
    return requestJson('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

window.dbHelpers = {
    saveUser,
    authenticateUser,
};