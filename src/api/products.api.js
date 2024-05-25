import axios from 'axios';

export const getAllProducts = async () => {
    try {
        const res = await axios.get('http://localhost:8000/products/api/v1/products');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};