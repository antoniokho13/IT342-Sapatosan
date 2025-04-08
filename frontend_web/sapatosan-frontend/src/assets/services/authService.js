import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users`, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                role: 'USER' // Default role
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error('Registration failed');
        }
    },

    login: async (loginData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: loginData.email,
                password: loginData.password
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error('Login failed');
        }
    }
};