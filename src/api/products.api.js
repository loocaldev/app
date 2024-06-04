import axios from 'axios';

export const getAllProducts = async () => {
    try {
        const res = await axios.get('https://server-production-1ddc.up.railway.app/products/api/v1/products/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export const createOrder = async () => {
    try {
        const res = await axios.get('https://server-production-1ddc.up.railway.app/orders/api/v1/orders/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};  