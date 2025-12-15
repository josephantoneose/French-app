import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Path to data file
const DATA_FILE = path.join(__dirname, 'questions.json');

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Get all data
app.get('/api/data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// Update questions for a category
app.post('/api/save', (req, res) => {
    const { categoryId, questions } = req.body;

    if (!categoryId || !questions) {
        return res.status(400).json({ error: 'Missing categoryId or questions' });
    }

    // Read current data
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }

        let categories = JSON.parse(data);

        // Update the specific category
        const categoryIndex = categories.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) {
            return res.status(404).json({ error: 'Category not found' });
        }

        categories[categoryIndex].questions = questions;

        // Write back to file
        fs.writeFile(DATA_FILE, JSON.stringify(categories, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to write data' });
            }
            res.json({ success: true, categories });
        });
    });
});

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
