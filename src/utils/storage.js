import { initialCategories } from '../data/initialCategories';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'french_app_categories_v1';

// --- Local Storage fallback (Synchronous) ---
export const loadLocalCategories = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : initialCategories;
    } catch (e) {
        console.error("Failed to load local categories", e);
        return initialCategories;
    }
};

export const saveLocalCategories = (categories) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error("Failed to save local categories", e);
    }
};

// --- Cloud Sync (Asynchronous) ---

// We will use a single row in a 'app_data' table for simplicity
// format: { id: 1, categories: [...] }
const ROW_ID = 1;

export const fetchCloudCategories = async () => {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('app_data')
            .select('categories')
            .eq('id', ROW_ID)
            .single();

        if (error) {
            // If row doesn't exist, we might need to create it, or just return null
            if (error.code === 'PGRST116') { // Row not found
                return null;
            }
            console.error("Supabase fetch error:", error);
            return null;
        }

        return data?.categories || null;
    } catch (e) {
        console.error("Cloud fetch failed:", e);
        return null;
    }
};

export const saveCloudCategories = async (categories) => {
    if (!supabase) return;

    try {
        // Upsert: Create or Update row 1
        const { error } = await supabase
            .from('app_data')
            .upsert({ id: ROW_ID, categories: categories });

        if (error) throw error;
    } catch (e) {
        console.error("Cloud save failed:", e);
    }
};
