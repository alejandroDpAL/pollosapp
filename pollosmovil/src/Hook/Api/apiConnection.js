
import axios from "axios";

// Create an Axios instance
const api = axios.create({
    baseURL: "http://192.168.100.100:3000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});



export default api;
