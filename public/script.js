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
    document.getElementById('add-goal-btn')?.addEventListener('click', showAddGoalModal);
});

function loadDashboardData() {
    Promise.all([
        fetch('/api/accounts').then(r => r.json()),
        fetch('/api/investments').then(r => r.json()),
        fetch('/api/expenses').then(r => r.json())
    ])
    .then(([accounts, investments, expenses]) => {
        updateDashboardStats(accounts, investments, expenses);
    })
    .catch(error => console.error('Error loading dashboard:', error));
}

function updateDashboardStats(accounts, investments, expenses) {
    // Calculate total account balances
    let accountsTotal = 0;
    accounts.forEach(account => {
        accountsTotal += account.balance || 0;
    });
    
    // Calculate total investments value
    let investmentsTotal = 0;
    investments.forEach(investment => {
        const currentValue = investment.current_price > 0 ? 
            investment.shares * investment.current_price : 
            investment.shares * investment.purchase_price;
        investmentsTotal += currentValue;
    });
    
    // Calculate monthly expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let monthlyExpenses = 0;
    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= thirtyDaysAgo) {
            monthlyExpenses += expense.amount;
        }
    });
    
    // Calculate net worth (assets - recent expenses, simplified)
    const netWorth = accountsTotal + investmentsTotal;
    
    // Calculate savings rate (simplified assumption)
    const monthlyIncome = 5000; // placeholder, could be configurable
    const savingsRate = monthlyIncome > 0 ? 
        Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
    
    // Update dashboard display
    document.getElementById('net-worth').textContent = `$${netWorth.toFixed(2)}`;
    document.getElementById('monthly-income').textContent = `$${monthlyIncome.toFixed(2)}`;
    document.getElementById('monthly-expenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
    document.getElementById('savings-rate').textContent = `${savingsRate.toFixed(1)}%`;
    document.getElementById('portfolio-value').textContent = `$${investmentsTotal.toFixed(2)}`;
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
    fetch('/api/investments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            symbol: symbol,
            shares: shares,
            purchase_price: price
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
    fetch('/api/investments')
        .then(response => response.json())
        .then(data => {
            updatePortfolioTable(data);
            updatePortfolioSummary(data);
        })
        .catch(error => console.error('Error loading portfolio:', error));
}

function updatePortfolioTable(investments) {
    const tbody = document.querySelector('#investments-table tbody');
    tbody.innerHTML = '';
    
    investments.forEach(investment => {
        const row = document.createElement('tr');
        const totalValue = investment.shares * investment.purchase_price;
        const currentValue = investment.current_price > 0 ? investment.shares * investment.current_price : totalValue;
        const gainLoss = currentValue - totalValue;
        const gainLossPercent = totalValue > 0 ? ((gainLoss / totalValue) * 100).toFixed(2) : 0;
        
        row.innerHTML = `
            <td>${investment.symbol}</td>
            <td>${investment.shares}</td>
            <td>$${investment.purchase_price.toFixed(2)}</td>
            <td>$${currentValue.toFixed(2)}</td>
            <td style="color: ${gainLoss >= 0 ? 'green' : 'red'}">
                $${gainLoss.toFixed(2)} (${gainLossPercent}%)
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePortfolioSummary(investments) {
    let totalValue = 0;
    let totalCost = 0;
    
    investments.forEach(investment => {
        const cost = investment.shares * investment.purchase_price;
        const current = investment.current_price > 0 ? 
            investment.shares * investment.current_price : cost;
        
        totalCost += cost;
        totalValue += current;
    });
    
    const totalGain = totalValue - totalCost;
    
    document.getElementById('portfolio-value').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('portfolio-gain').textContent = `$${totalGain.toFixed(2)}`;
    document.getElementById('portfolio-gain').style.color = totalGain >= 0 ? 'green' : 'red';
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
    fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: description,
            amount: amount,
            category: category
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Expense added:', data);
        loadExpenseData();
        loadDashboardData();
    })
    .catch(error => console.error('Error adding expense:', error));
}

function loadExpenseData() {
    fetch('/api/expenses')
        .then(response => response.json())
        .then(data => {
            updateExpenseList(data);
        })
        .catch(error => console.error('Error loading expenses:', error));
}

function updateExpenseList(expenses) {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    
    expenses.slice(0, 10).forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        const date = new Date(expense.date).toLocaleDateString();
        expenseItem.innerHTML = `
            <div>
                <strong>${expense.description}</strong>
                <small style="display: block; color: #666;">${expense.category} • ${date}</small>
            </div>
            <div class="amount" style="font-size: 1rem; color: #e74c3c;">-$${expense.amount.toFixed(2)}</div>
        `;
        expenseList.appendChild(expenseItem);
    });
}

// Load expense data when switching to expenses tab
document.addEventListener('DOMContentLoaded', function() {
    const expensesLink = document.querySelector('a[href="#expenses"]');
    if (expensesLink) {
        expensesLink.addEventListener('click', loadExpenseData);
    }
    
    const portfolioLink = document.querySelector('a[href="#portfolio"]');
    if (portfolioLink) {
        portfolioLink.addEventListener('click', loadPortfolioData);
    }
    
    const goalsLink = document.querySelector('a[href="#goals"]');
    if (goalsLink) {
        goalsLink.addEventListener('click', loadGoalsData);
    }
});

function showAddGoalModal() {
    const title = prompt('Goal title (e.g., Emergency Fund):');
    const target = prompt('Target amount:');
    const current = prompt('Current amount (optional):') || '0';
    
    if (title && target) {
        addGoal(title, parseFloat(target), parseFloat(current));
    }
}

function addGoal(title, target, current) {
    const goals = JSON.parse(localStorage.getItem('wealthwise-goals') || '[]');
    const newGoal = {
        id: Date.now(),
        title: title,
        target: target,
        current: current,
        created: new Date().toISOString()
    };
    
    goals.push(newGoal);
    localStorage.setItem('wealthwise-goals', JSON.stringify(goals));
    loadGoalsData();
}

function loadGoalsData() {
    const goals = JSON.parse(localStorage.getItem('wealthwise-goals') || '[]');
    updateGoalsList(goals);
}

function updateGoalsList(goals) {
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = '';
    
    if (goals.length === 0) {
        goalsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No financial goals set yet. Click "Add Goal" to get started!</p>';
        return;
    }
    
    goals.forEach(goal => {
        const percentage = Math.min((goal.current / goal.target) * 100, 100);
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-target">$${goal.target.toFixed(2)}</div>
            </div>
            <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${percentage}%"></div>
            </div>
            <div class="goal-details">
                <span>$${goal.current.toFixed(2)} saved</span>
                <span>${percentage.toFixed(1)}% complete</span>
            </div>
        `;
        goalsList.appendChild(goalItem);
    });
}