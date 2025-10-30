
import axios from "axios";

// Create an Axios instance
const api = axios.create({
    baseURL: "http://172.24.144.1:3000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});



export default api;
