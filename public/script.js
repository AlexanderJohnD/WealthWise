document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Initialize dashboard
    loadDashboardData();
    
    // Event listeners for buttons
    document.getElementById('add-investment-btn')?.addEventListener('click', showAddInvestmentModal);
    document.getElementById('add-expense-btn')?.addEventListener('click', showAddExpenseModal);
});

function loadDashboardData() {
    fetch('/api/accounts')
        .then(response => response.json())
        .then(data => {
            updateDashboardStats(data);
        })
        .catch(error => console.error('Error loading dashboard:', error));
}

function updateDashboardStats(accounts) {
    let totalBalance = 0;
    accounts.forEach(account => {
        totalBalance += account.balance || 0;
    });
    
    document.getElementById('net-worth').textContent = `$${totalBalance.toFixed(2)}`;
    document.getElementById('portfolio-value').textContent = `$${totalBalance.toFixed(2)}`;
}

function showAddInvestmentModal() {
    const symbol = prompt('Enter stock symbol (e.g., AAPL):');
    const shares = prompt('Number of shares:');
    const price = prompt('Purchase price per share:');
    
    if (symbol && shares && price) {
        addInvestment(symbol, parseInt(shares), parseFloat(price));
    }
}

function addInvestment(symbol, shares, price) {
    const totalValue = shares * price;
    
    // Create account for this investment
    fetch('/api/accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: `${symbol} Stock`,
            type: 'investment',
            balance: totalValue
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Investment added:', data);
        loadDashboardData();
        loadPortfolioData();
    })
    .catch(error => console.error('Error adding investment:', error));
}

function loadPortfolioData() {
    fetch('/api/accounts')
        .then(response => response.json())
        .then(data => {
            const investments = data.filter(account => account.type === 'investment');
            updatePortfolioTable(investments);
        })
        .catch(error => console.error('Error loading portfolio:', error));
}

function updatePortfolioTable(investments) {
    const tbody = document.querySelector('#investments-table tbody');
    tbody.innerHTML = '';
    
    investments.forEach(investment => {
        const row = document.createElement('tr');
        const symbol = investment.name.replace(' Stock', '');
        row.innerHTML = `
            <td>${symbol}</td>
            <td>-</td>
            <td>-</td>
            <td>$${investment.balance.toFixed(2)}</td>
            <td>-</td>
        `;
        tbody.appendChild(row);
    });
}

function showAddExpenseModal() {
    const description = prompt('Expense description:');
    const amount = prompt('Amount:');
    const category = prompt('Category (e.g., Food, Transport, Entertainment):');
    
    if (description && amount && category) {
        addExpense(description, parseFloat(amount), category);
    }
}

function addExpense(description, amount, category) {
    console.log('Adding expense:', { description, amount, category });
    
    const expenseList = document.getElementById('expense-list');
    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';
    expenseItem.innerHTML = `
        <div>
            <strong>${description}</strong>
            <small style="display: block; color: #666;">${category}</small>
        </div>
        <div class="amount" style="font-size: 1rem;">-$${amount.toFixed(2)}</div>
    `;
    expenseList.appendChild(expenseItem);
}