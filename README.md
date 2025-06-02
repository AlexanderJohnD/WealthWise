# WealthWise

A personal wealth management tool to track investments, expenses, and financial goals.

## Features

- **Dashboard** - View net worth, monthly income/expenses, and savings rate
- **Portfolio Tracking** - Add and track stock investments with gain/loss calculations
- **Expense Monitoring** - Record and categorize daily expenses
- **Financial Goals** - Set and track progress toward financial targets
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Local SQLite database with localStorage for goals

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Usage

### Adding Investments
1. Go to Portfolio tab
2. Click "Add Investment"
3. Enter stock symbol, shares, and purchase price

### Tracking Expenses
1. Go to Expenses tab
2. Click "Add Expense"
3. Enter description, amount, and category

### Setting Goals
1. Go to Goals tab
2. Click "Add Goal"
3. Enter goal title, target amount, and current amount

## Project Structure

```
WealthWise/
├── server.js          # Express server and API routes
├── database.js        # SQLite database setup
├── package.json       # Dependencies
├── public/            # Frontend files
│   ├── index.html     # Main HTML
│   ├── style.css      # Styles and responsive design
│   └── script.js      # Frontend JavaScript
└── README.md          # Documentation
```

## Database Schema

- **users** - User accounts
- **accounts** - Bank/investment accounts
- **investments** - Stock holdings
- **expenses** - Expense records
- **transactions** - Transaction history

## Contributing

This is a personal project for learning purposes.