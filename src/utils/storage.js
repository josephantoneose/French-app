import { initialCategories } from '../data/initialCategories';

const STORAGE_KEY = 'french_app_categories_v1';

export const loadCategories = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : initialCategories;
    } catch (e) {
        console.error("Failed to load categories", e);
        return initialCategories;
    }
};

export const saveCategories = (categories) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error("Failed to save categories", e);
    }
};
