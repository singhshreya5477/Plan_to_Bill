const API_URL = 'http://localhost:5000/api';
let authToken = null;
let currentUser = null;

// Show/Hide functions
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('verifyOtpForm').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('verifyOtpForm').classList.add('hidden');
}

function showVerifyOtpForm(email) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('verifyOtpForm').classList.remove('hidden');
    document.getElementById('verifyEmail').value = email;
    document.getElementById('otpCode').value = '';
    document.getElementById('otpCode').focus();
}

function showResponse(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    element.classList.remove('hidden', 'error', 'success');
    element.classList.add(isError ? 'error' : 'success');
    element.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

// Authentication
async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const companyName = document.getElementById('regCompany').value;
    const role = document.getElementById('regRole').value;

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                companyName,
                role
            })
        });

        const data = await response.json();
        showResponse('authResponse', data, !response.ok);

        if (response.ok) {
            // Show OTP verification form
            showVerifyOtpForm(email);
        }
    } catch (error) {
        showResponse('authResponse', { error: error.message }, true);
    }
}

async function verifyEmail() {
    const email = document.getElementById('verifyEmail').value;
    const otp = document.getElementById('otpCode').value;

    if (!otp || otp.length !== 6) {
        showResponse('authResponse', { error: 'Please enter a valid 6-digit OTP' }, true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        showResponse('authResponse', data, !response.ok);

        if (response.ok) {
            alert('✅ Email verified successfully! You can now login.');
            showLoginForm();
            // Pre-fill login email
            document.getElementById('loginEmail').value = email;
        }
    } catch (error) {
        showResponse('authResponse', { error: error.message }, true);
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        
        if (response.ok) {
            // Backend returns: { success, message, data: { token, user } }
            authToken = result.data.token;
            currentUser = result.data.user;
            
            document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('userRole').textContent = currentUser.role;
            
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('verifyOtpForm').classList.add('hidden');
            document.getElementById('userInfo').classList.remove('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            
            showResponse('authResponse', result);
        } else {
            showResponse('authResponse', result, true);
        }
    } catch (error) {
        showResponse('authResponse', { error: error.message }, true);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('authResponse').classList.add('hidden');
    
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Projects
async function createProject() {
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;
    const budget = document.getElementById('projectBudget').value;
    const status = document.getElementById('projectStatus').value;
    const start_date = document.getElementById('projectStartDate').value;
    const end_date = document.getElementById('projectEndDate').value;

    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name,
                description,
                budget: budget ? parseFloat(budget) : null,
                status,
                start_date: start_date || null,
                end_date: end_date || null
            })
        });

        const data = await response.json();
        showResponse('projectResponse', data, !response.ok);
    } catch (error) {
        showResponse('projectResponse', { error: error.message }, true);
    }
}

async function getProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        showResponse('projectResponse', data, !response.ok);
    } catch (error) {
        showResponse('projectResponse', { error: error.message }, true);
    }
}

// Tasks
async function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const project_id = document.getElementById('taskProjectId').value;
    const assigned_to = document.getElementById('taskAssignedTo').value;
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;
    const due_date = document.getElementById('taskDueDate').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                description,
                project_id: parseInt(project_id),
                assigned_to: assigned_to ? parseInt(assigned_to) : null,
                priority,
                status,
                due_date: due_date || null
            })
        });

        const data = await response.json();
        showResponse('taskResponse', data, !response.ok);
    } catch (error) {
        showResponse('taskResponse', { error: error.message }, true);
    }
}

async function getTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        showResponse('taskResponse', data, !response.ok);
    } catch (error) {
        showResponse('taskResponse', { error: error.message }, true);
    }
}

// Expenses
async function createExpense() {
    const title = document.getElementById('expenseTitle').value;
    const description = document.getElementById('expenseDesc').value;
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    const project_id = document.getElementById('expenseProjectId').value;

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                description,
                amount: parseFloat(amount),
                category,
                project_id: parseInt(project_id)
            })
        });

        const data = await response.json();
        showResponse('expenseResponse', data, !response.ok);
    } catch (error) {
        showResponse('expenseResponse', { error: error.message }, true);
    }
}

async function getExpenses() {
    try {
        const response = await fetch(`${API_URL}/expenses`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        showResponse('expenseResponse', data, !response.ok);
    } catch (error) {
        showResponse('expenseResponse', { error: error.message }, true);
    }
}

async function reviewExpense() {
    const expenseId = document.getElementById('reviewExpenseId').value;
    const status = document.getElementById('reviewAction').value;

    try {
        const response = await fetch(`${API_URL}/expenses/${expenseId}/review`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        showResponse('expenseResponse', data, !response.ok);
    } catch (error) {
        showResponse('expenseResponse', { error: error.message }, true);
    }
}

// Invoices
async function createInvoice() {
    const client_name = document.getElementById('invoiceClientName').value;
    const client_email = document.getElementById('invoiceClientEmail').value;
    const project_id = document.getElementById('invoiceProjectId').value;
    const amount = document.getElementById('invoiceAmount').value;
    const tax_amount = document.getElementById('invoiceTax').value;
    const issue_date = document.getElementById('invoiceIssueDate').value;
    const due_date = document.getElementById('invoiceDueDate').value;
    const notes = document.getElementById('invoiceNotes').value;

    try {
        const response = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                client_name,
                client_email,
                project_id: parseInt(project_id),
                amount: parseFloat(amount),
                tax_amount: tax_amount ? parseFloat(tax_amount) : 0,
                issue_date,
                due_date,
                notes,
                items: [] // Can add items later
            })
        });

        const data = await response.json();
        showResponse('invoiceResponse', data, !response.ok);
    } catch (error) {
        showResponse('invoiceResponse', { error: error.message }, true);
    }
}

async function getInvoices() {
    try {
        const response = await fetch(`${API_URL}/invoices`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        showResponse('invoiceResponse', data, !response.ok);
    } catch (error) {
        showResponse('invoiceResponse', { error: error.message }, true);
    }
}

async function sendInvoice() {
    const invoiceId = document.getElementById('invoiceActionId').value;

    try {
        const response = await fetch(`${API_URL}/invoices/${invoiceId}/send`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        showResponse('invoiceResponse', data, !response.ok);
    } catch (error) {
        showResponse('invoiceResponse', { error: error.message }, true);
    }
}

async function markInvoicePaid() {
    const invoiceId = document.getElementById('invoiceActionId').value;
    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await fetch(`${API_URL}/invoices/${invoiceId}/mark-paid`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ paid_date: today })
        });

        const data = await response.json();
        showResponse('invoiceResponse', data, !response.ok);
    } catch (error) {
        showResponse('invoiceResponse', { error: error.message }, true);
    }
}

// Initialize
console.log('Plan to Bill Testing UI loaded. Backend API URL:', API_URL);
console.log('Make sure the backend server is running on port 5000');
