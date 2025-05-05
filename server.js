const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/accounts', (req, res) => {
    db.all('SELECT * FROM accounts', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/accounts', (req, res) => {
    const { name, type, balance } = req.body;
    db.run('INSERT INTO accounts (name, type, balance, user_id) VALUES (?, ?, ?, ?)',
        [name, type, balance || 0, 1], // default user_id = 1 for now
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, name, type, balance });
        }
    );
});

app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Investment endpoints
app.get('/api/investments', (req, res) => {
    db.all('SELECT * FROM investments ORDER BY purchase_date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/investments', (req, res) => {
    const { symbol, shares, purchase_price } = req.body;
    db.run('INSERT INTO investments (symbol, shares, purchase_price, user_id) VALUES (?, ?, ?, ?)',
        [symbol, shares, purchase_price, 1],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                id: this.lastID, 
                symbol, 
                shares, 
                purchase_price 
            });
        }
    );
});

// Expense endpoints
app.get('/api/expenses', (req, res) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/expenses', (req, res) => {
    const { amount, description, category } = req.body;
    db.run('INSERT INTO expenses (amount, description, category, user_id) VALUES (?, ?, ?, ?)',
        [amount, description, category, 1],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                id: this.lastID, 
                amount, 
                description, 
                category 
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`WealthWise server running on port ${PORT}`);
});