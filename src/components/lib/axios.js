import Axios from 'axios';

const axios = Axios.create({
    //baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true, // Otomatis membaca cookie XSRF-TOKEN dan mengirimnya di header
});

export default axios;