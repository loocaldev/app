import axios from 'axios';

export const getAllProducts = async () => {
    try {
        const res = await axios.get('http://44.220.218.144/api/products/api/v1/products/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export const createOrder = async () => {
    try {
        const res = await axios.get('https://44.220.218.144/api/orders/api/v1/orders/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};  