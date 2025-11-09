import api from './api';

const financialService = {
    // ============================================
    // SALES ORDERS
    // ============================================
    getSalesOrders: async (projectId = null) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return await api.get(`/sales-orders${params}`);
    },

    getSalesOrderById: async (id) => {
        return await api.get(`/sales-orders/${id}`);
    },

    createSalesOrder: async (data) => {
        return await api.post('/sales-orders', data);
    },

    updateSalesOrder: async (id, data) => {
        return await api.put(`/sales-orders/${id}`, data);
    },

    updateSalesOrderStatus: async (id, status) => {
        return await api.patch(`/sales-orders/${id}/status`, { status });
    },

    deleteSalesOrder: async (id) => {
        return await api.delete(`/sales-orders/${id}`);
    },

    // ============================================
    // PURCHASE ORDERS
    // ============================================
    getPurchaseOrders: async (projectId = null) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return await api.get(`/purchase-orders${params}`);
    },

    getPurchaseOrderById: async (id) => {
        return await api.get(`/purchase-orders/${id}`);
    },

    createPurchaseOrder: async (data) => {
        return await api.post('/purchase-orders', data);
    },

    updatePurchaseOrder: async (id, data) => {
        return await api.put(`/purchase-orders/${id}`, data);
    },

    updatePurchaseOrderStatus: async (id, status) => {
        return await api.patch(`/purchase-orders/${id}/status`, { status });
    },

    deletePurchaseOrder: async (id) => {
        return await api.delete(`/purchase-orders/${id}`);
    },

    // ============================================
    // VENDOR BILLS
    // ============================================
    getVendorBills: async (projectId = null) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return await api.get(`/vendor-bills${params}`);
    },

    getVendorBillById: async (id) => {
        return await api.get(`/vendor-bills/${id}`);
    },

    createVendorBill: async (data) => {
        return await api.post('/vendor-bills', data);
    },

    updateVendorBill: async (id, data) => {
        return await api.put(`/vendor-bills/${id}`, data);
    },

    updateVendorBillStatus: async (id, status) => {
        return await api.patch(`/vendor-bills/${id}/status`, { status });
    },

    deleteVendorBill: async (id) => {
        return await api.delete(`/vendor-bills/${id}`);
    },

    // ============================================
    // EXPENSES
    // ============================================
    getExpenses: async (projectId = null) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return await api.get(`/expenses${params}`);
    },

    getExpenseById: async (id) => {
        return await api.get(`/expenses/${id}`);
    },

    createExpense: async (data) => {
        return await api.post('/expenses', data);
    },

    updateExpense: async (id, data) => {
        return await api.put(`/expenses/${id}`, data);
    },

    updateExpenseStatus: async (id, status, rejection_reason = null) => {
        return await api.patch(`/expenses/${id}/status`, { status, rejection_reason });
    },

    deleteExpense: async (id) => {
        return await api.delete(`/expenses/${id}`);
    },

    getExpenseSummary: async (projectId = null) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return await api.get(`/expenses/summary${params}`);
    },

    // ============================================
    // INVOICES (from existing billingService - for reference)
    // ============================================
    getInvoices: async (projectId = null) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return await api.get(`/billing/invoices${params}`);
    },
};

export default financialService;
