import axios from 'axios';

// Obtener todos los productos
export const getAllProducts = async () => {
    try {
        const res = await axios.get('https://loocal.co/api/products/api/v1/products/');
        return res;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

// Obtener todas las categorías
export const getAllCategories = async () => {
    try {
        const res = await axios.get('https://loocal.co/api/products/api/v1/categories/');
        return res;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
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