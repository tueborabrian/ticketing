import axios from 'axios';

const ApiClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on the server

        return axios.create({
            baseURL: 'http://ticketing.grumbleranch.com',
            headers: req.headers
        });
    } else {
        return axios.create({
            baseURL: ''
        });
    }
};

export default ApiClient;