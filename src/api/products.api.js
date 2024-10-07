import axios from 'axios';

export const getAllProducts = async () => {
    try {
        const res = await axios.get('https://loocal.co/api/products/api/v1/products/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export const createOrder = async () => {
    try {
        const res = await axios.get('https://loocal.co/api/orders/api/v1/orders/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};  