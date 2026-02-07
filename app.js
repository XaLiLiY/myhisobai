// API Base URL
const API_URL = window.location.origin;
let currentUser = null;
let token = localStorage.getItem('token');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showApp();
        loadDashboard();
    } else {
        showLogin();
    }

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Add form
    document.getElementById('addForm').addEventListener('submit', handleAdd);
    
    // Payment form
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = today;
    });
}

// ============ AUTH FUNCTIONS ============

function showAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            showApp();
            loadDashboard();
        } else {
            alert(data.error || 'Kirish xatosi');
        }
    } catch (error) {
        alert('Server bilan bog\'lanishda xato');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const full_name = document.getElementById('registerFullName').value;

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, full_name })
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            showApp();
            loadDashboard();
        } else {
            alert(data.error || 'Ro\'yxatdan o\'tish xatosi');
        }
    } catch (error) {
        alert('Server bilan bog\'lanishda xato');
    }
}

function logout() {
    if (confirm('Chiqishni xohlaysizmi?')) {
        token = null;
        currentUser = null;
        localStorage.removeItem('token');
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('appScreen').style.display = 'none';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
}

// ============ NAVIGATION ============

function showPage(pageName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}Page`).classList.add('active');

    // Load data for page
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'income':
            loadIncome();
            break;
        case 'expense':
            loadExpense();
            break;
        case 'debts':
            loadDebts();
            break;
        case 'ai':
            loadAIAnalysis();
            break;
    }
}

// ============ DASHBOARD ============

async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/api/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const stats = await response.json();
        
        document.getElementById('balanceValue').textContent = formatMoney(stats.balance);
        document.getElementById('totalIncomeValue').textContent = formatMoney(stats.totalIncome);
        document.getElementById('totalExpenseValue').textContent = formatMoney(stats.totalExpenses);
        document.getElementById('debtsGivenValue').textContent = formatMoney(stats.debtsGiven);
        document.getElementById('debtsTakenValue').textContent = formatMoney(stats.debtsTaken);

        // Update trend
        const trendElement = document.querySelector('.stat-trend');
        if (stats.balance > 0) {
            trendElement.textContent = '↗ Yaxshi';
            trendElement.className = 'stat-trend positive';
        } else {
            trendElement.textContent = '↘ Diqqat';
            trendElement.className = 'stat-trend negative';
        }
    } catch (error) {
        console.error('Dashboard xatosi:', error);
    }
}

// ============ INCOME ============

async function loadIncome() {
    try {
        const response = await fetch(`${API_URL}/api/income`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const income = await response.json();
        const listElement = document.getElementById('incomeList');

        if (income.length === 0) {
            listElement.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💵</div><p>Daromad yo\'q</p></div>';
            return;
        }

        listElement.innerHTML = income.map(item => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${item.category}</h4>
                    <p>${item.description || ''} • ${formatDate(item.date)}</p>
                </div>
                <div class="transaction-amount income">+${formatMoney(item.amount)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Daromad yuklash xatosi:', error);
    }
}

// ============ EXPENSE ============

async function loadExpense() {
    try {
        const response = await fetch(`${API_URL}/api/expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const expenses = await response.json();
        const listElement = document.getElementById('expenseList');

        if (expenses.length === 0) {
            listElement.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💸</div><p>Xarajat yo\'q</p></div>';
            return;
        }

        listElement.innerHTML = expenses.map(item => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${item.category}</h4>
                    <p>${item.description || ''} • ${formatDate(item.date)}</p>
                </div>
                <div class="transaction-amount expense">-${formatMoney(item.amount)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Xarajat yuklash xatosi:', error);
    }
}

// ============ DEBTS ============

let currentDebtFilter = 'all';

async function loadDebts() {
    try {
        const response = await fetch(`${API_URL}/api/debts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        let debts = await response.json();
        
        // Apply filter
        if (currentDebtFilter !== 'all') {
            debts = debts.filter(d => d.type === currentDebtFilter);
        }

        const listElement = document.getElementById('debtsList');

        if (debts.length === 0) {
            listElement.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤝</div><p>Qarz yo\'q</p></div>';
            return;
        }

        listElement.innerHTML = debts.map(debt => {
            const isOverdue = debt.status === 'active' && debt.due_date && new Date(debt.due_date) < new Date();
            const statusClass = isOverdue ? 'overdue' : debt.status;
            
            return `
                <div class="debt-card ${debt.type} ${statusClass}">
                    <div class="debt-header">
                        <div class="debt-person">${debt.person_name}</div>
                        <span class="debt-badge ${statusClass}">
                            ${debt.status === 'paid' ? 'To\'langan' : isOverdue ? 'Muddati o\'tgan' : 'Faol'}
                        </span>
                    </div>
                    <div class="debt-details">
                        <div class="debt-detail">
                            <span class="debt-detail-label">Umumiy summa:</span>
                            <span class="debt-detail-value">${formatMoney(debt.amount)}</span>
                        </div>
                        <div class="debt-detail">
                            <span class="debt-detail-label">Qolgan:</span>
                            <span class="debt-detail-value">${formatMoney(debt.remaining_amount)}</span>
                        </div>
                        <div class="debt-detail">
                            <span class="debt-detail-label">Turi:</span>
                            <span class="debt-detail-value">${debt.type === 'given' ? 'Berilgan' : 'Olingan'}</span>
                        </div>
                        <div class="debt-detail">
                            <span class="debt-detail-label">Muddat:</span>
                            <span class="debt-detail-value">${debt.due_date ? formatDate(debt.due_date) : '-'}</span>
                        </div>
                    </div>
                    ${debt.description ? `<p style="margin-top: 0.5rem; color: var(--text-light);">${debt.description}</p>` : ''}
                    ${debt.status === 'active' ? `
                        <div class="debt-actions">
                            <button class="btn btn-primary btn-small" onclick="showPaymentModal(${debt.id})">
                                To'lov qo'shish
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Qarzlarni yuklash xatosi:', error);
    }
}

function filterDebts(filter) {
    currentDebtFilter = filter;
    
    // Update tabs
    document.querySelectorAll('.debt-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadDebts();
}

// ============ AI ANALYSIS ============

async function loadAIAnalysis() {
    try {
        const response = await fetch(`${API_URL}/api/ai-analysis`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const analysis = await response.json();
        
        // Insights
        const insightsElement = document.getElementById('aiInsights');
        if (analysis.insights.length > 0) {
            insightsElement.innerHTML = '<h3>📊 Tahlillar</h3>' + 
                analysis.insights.map(insight => `
                    <div class="ai-card">
                        <h3>${insight.title}</h3>
                        <p>${insight.message}</p>
                    </div>
                `).join('');
        } else {
            insightsElement.innerHTML = '';
        }

        // Recommendations
        const recElement = document.getElementById('aiRecommendations');
        if (analysis.recommendations.length > 0) {
            recElement.innerHTML = '<h3>💡 Maslahatlar</h3>' + 
                analysis.recommendations.map(rec => `
                    <div class="ai-card ${rec.type}">
                        <h3>${rec.title}</h3>
                        <p>${rec.message}</p>
                    </div>
                `).join('');
        } else {
            recElement.innerHTML = '';
        }

        // Alerts
        const alertsElement = document.getElementById('aiAlerts');
        if (analysis.alerts.length > 0) {
            alertsElement.innerHTML = '<h3>⚠️ Ogohlantirishlar</h3>' + 
                analysis.alerts.map(alert => `
                    <div class="ai-card ${alert.type}">
                        <h3>${alert.title}</h3>
                        <p>${alert.message}</p>
                    </div>
                `).join('');
        } else {
            alertsElement.innerHTML = '';
        }

        if (analysis.insights.length === 0 && analysis.recommendations.length === 0 && analysis.alerts.length === 0) {
            insightsElement.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤖</div><p>Ma\'lumotlar yetarli emas. Ko\'proq daromad va xarajat qo\'shing.</p></div>';
        }
    } catch (error) {
        console.error('AI tahlil xatosi:', error);
    }
}

// ============ MODAL FUNCTIONS ============

let currentModalType = null;

function showAddModal(type) {
    currentModalType = type;
    const modal = document.getElementById('addModal');
    const title = document.getElementById('modalTitle');
    const fields = document.getElementById('modalFields');

    const categories = {
        income: ['Oylik maosh', 'Biznes', 'Qo\'shimcha ish', 'Investitsiya', 'Boshqa'],
        expense: ['Oziq-ovqat', 'Transport', 'Uy-joy', 'Ta\'lim', 'Sog\'liqni saqlash', 'Ko\'ngilochar', 'Kiyim', 'Boshqa']
    };

    let html = '';

    if (type === 'income') {
        title.textContent = 'Daromad qo\'shish';
        html = `
            <div class="form-group">
                <label>Kategoriya</label>
                <select id="modalCategory" required>
                    ${categories.income.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Miqdor (so'm)</label>
                <input type="number" id="modalAmount" required min="0">
            </div>
            <div class="form-group">
                <label>Izoh</label>
                <input type="text" id="modalDescription">
            </div>
            <div class="form-group">
                <label>Sana</label>
                <input type="date" id="modalDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>
        `;
    } else if (type === 'expense') {
        title.textContent = 'Xarajat qo\'shish';
        html = `
            <div class="form-group">
                <label>Kategoriya</label>
                <select id="modalCategory" required>
                    ${categories.expense.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Miqdor (so'm)</label>
                <input type="number" id="modalAmount" required min="0">
            </div>
            <div class="form-group">
                <label>Izoh</label>
                <input type="text" id="modalDescription">
            </div>
            <div class="form-group">
                <label>Sana</label>
                <input type="date" id="modalDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>
        `;
    } else if (type === 'debt') {
        title.textContent = 'Qarz qo\'shish';
        html = `
            <div class="form-group">
                <label>Turi</label>
                <select id="modalDebtType" required>
                    <option value="given">Berilgan qarz</option>
                    <option value="taken">Olingan qarz</option>
                </select>
            </div>
            <div class="form-group">
                <label>Shaxs nomi</label>
                <input type="text" id="modalPersonName" required>
            </div>
            <div class="form-group">
                <label>Summa (so'm)</label>
                <input type="number" id="modalAmount" required min="0">
            </div>
            <div class="form-group">
                <label>Qaytarish muddati</label>
                <input type="date" id="modalDueDate">
            </div>
            <div class="form-group">
                <label>Izoh</label>
                <textarea id="modalDescription" rows="3"></textarea>
            </div>
        `;
    }

    fields.innerHTML = html;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('addForm').reset();
}

async function handleAdd(e) {
    e.preventDefault();

    let endpoint = '';
    let data = {};

    if (currentModalType === 'income') {
        endpoint = '/api/income';
        data = {
            category: document.getElementById('modalCategory').value,
            amount: parseFloat(document.getElementById('modalAmount').value),
            description: document.getElementById('modalDescription').value,
            date: document.getElementById('modalDate').value
        };
    } else if (currentModalType === 'expense') {
        endpoint = '/api/expenses';
        data = {
            category: document.getElementById('modalCategory').value,
            amount: parseFloat(document.getElementById('modalAmount').value),
            description: document.getElementById('modalDescription').value,
            date: document.getElementById('modalDate').value
        };
    } else if (currentModalType === 'debt') {
        endpoint = '/api/debts';
        data = {
            type: document.getElementById('modalDebtType').value,
            person_name: document.getElementById('modalPersonName').value,
            amount: parseFloat(document.getElementById('modalAmount').value),
            due_date: document.getElementById('modalDueDate').value || null,
            description: document.getElementById('modalDescription').value
        };
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadDashboard();
            
            // Reload current page
            if (currentModalType === 'income') loadIncome();
            if (currentModalType === 'expense') loadExpense();
            if (currentModalType === 'debt') loadDebts();
        } else {
            const error = await response.json();
            alert(error.error || 'Xato yuz berdi');
        }
    } catch (error) {
        alert('Server bilan bog\'lanishda xato');
    }
}

// ============ DEBT PAYMENT ============

function showPaymentModal(debtId) {
    document.getElementById('paymentDebtId').value = debtId;
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.getElementById('paymentForm').reset();
}

async function handlePayment(e) {
    e.preventDefault();

    const debtId = document.getElementById('paymentDebtId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const payment_date = document.getElementById('paymentDate').value;

    try {
        const response = await fetch(`${API_URL}/api/debts/${debtId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount, payment_date })
        });

        if (response.ok) {
            closePaymentModal();
            loadDashboard();
            loadDebts();
        } else {
            const error = await response.json();
            alert(error.error || 'Xato yuz berdi');
        }
    } catch (error) {
        alert('Server bilan bog\'lanishda xato');
    }
}

// ============ UTILITY FUNCTIONS ============

function formatMoney(amount) {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('uz-UZ', options);
}
