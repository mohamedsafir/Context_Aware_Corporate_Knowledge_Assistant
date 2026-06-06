import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Make sure this matches your backend URL
});

// Attach the token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// 🚨 NEW: Catch Expired Tokens Globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the backend says 401 Unauthorized (Invalid/Expired Token)
        if (error.response && error.response.status === 401) {
            console.warn("Token expired. Logging out...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect to login page instantly without an alert box
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;