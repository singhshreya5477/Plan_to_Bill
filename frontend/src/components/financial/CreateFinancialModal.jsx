import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import financialService from '../../services/financialService';

const CreateFinancialModal = ({ type, projectId, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState(getInitialFormData(type, projectId, initialData));
  const [items, setItems] = useState(
    initialData?.items || 
    getStoredItems(type) || 
    [{ description: '', quantity: 1, unit_price: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved form data from localStorage when component mounts
  useEffect(() => {
    if (!initialData) {
      const savedData = loadSavedFormData(type, projectId);
      if (savedData) {
        setFormData(savedData);
      }
    }
  }, [type, projectId, initialData]);

  function getStoredItems(type) {
    try {
      const key = `financial_items_${type}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  function loadSavedFormData(type, projectId) {
    try {
      const key = `financial_draft_${type}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Update project_id and dates to current values
        return {
          ...parsed,
          project_id: projectId,
          order_date: new Date().toISOString().split('T')[0],
          bill_date: new Date().toISOString().split('T')[0],
          expense_date: new Date().toISOString().split('T')[0]
        };
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
    return null;
  }

  function saveFormDataDraft(formData, items) {
    try {
      const key = `financial_draft_${type}`;
      const itemsKey = `financial_items_${type}`;
      
      // Save form data (excluding dates and project-specific data)
      const dataToSave = { ...formData };
      delete dataToSave.order_date;
      delete dataToSave.bill_date;
      delete dataToSave.expense_date;
      delete dataToSave.delivery_date;
      delete dataToSave.due_date;
      
      localStorage.setItem(key, JSON.stringify(dataToSave));
      
      // Save items separately (excluding the current values, just the structure)
      if (items && items.length > 0) {
        localStorage.setItem(itemsKey, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to save form draft:', error);
    }
  }

  function getInitialFormData(type, projectId, initialData) {
    if (initialData) {
      return initialData;
    }

    const baseData = { project_id: projectId };
    
    switch (type) {
      case 'sales-orders':
        return { 
          ...baseData, 
          customer_name: '', 
          customer_email: '', 
          customer_address: '',
          order_date: new Date().toISOString().split('T')[0], 
          delivery_date: '',
          status: 'draft', 
          tax_rate: 0,
          discount_amount: 0,
          notes: '',
          terms: ''
        };
      case 'purchase-orders':
        return { 
          ...baseData, 
          vendor_name: '', 
          vendor_email: '', 
          vendor_address: '',
          order_date: new Date().toISOString().split('T')[0], 
          delivery_date: '',
          status: 'draft', 
          tax_rate: 0,
          discount_amount: 0,
          notes: '',
          terms: ''
        };
      case 'vendor-bills':
        return { 
          ...baseData, 
          vendor_name: '', 
          bill_number: '',
          bill_date: new Date().toISOString().split('T')[0], 
          due_date: '', 
          payment_status: 'unpaid', 
          notes: '' 
        };
      case 'expenses':
        return { 
          ...baseData, 
          category: '', 
          description: '', 
          amount: 0, 
          expense_date: new Date().toISOString().split('T')[0], 
          is_billable: false 
        };
      default:
        return baseData;
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);
    
    // Save draft to localStorage (debounced would be better for production)
    if (!initialData) {
      saveFormDataDraft(newFormData, items);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].unit_price) || 0);
    }
    
    setItems(newItems);
    
    // Save items draft
    if (!initialData) {
      saveFormDataDraft(formData, newItems);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0);
  };

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear all saved data and start fresh?')) {
      const key = `financial_draft_${type}`;
      const itemsKey = `financial_items_${type}`;
      localStorage.removeItem(key);
      localStorage.removeItem(itemsKey);
      
      // Reset form to defaults
      setFormData(getInitialFormData(type, projectId, null));
      setItems([{ description: '', quantity: 1, unit_price: 0 }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      const total = type === 'expenses' ? parseFloat(formData.amount) : calculateTotal();
      const isEditing = initialData && initialData.id;

      switch (type) {
        case 'sales-orders':
          if (isEditing) {
            response = await financialService.updateSalesOrder(initialData.id, {
              ...formData,
              total,
              items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price)
              }))
            });
          } else {
            response = await financialService.createSalesOrder({
              ...formData,
              total,
              items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price)
              }))
            });
          }
          break;

        case 'purchase-orders':
          if (isEditing) {
            response = await financialService.updatePurchaseOrder(initialData.id, {
              ...formData,
              total,
              items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price)
              }))
            });
          } else {
            response = await financialService.createPurchaseOrder({
              ...formData,
              total,
              items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price)
              }))
            });
          }
          break;

        case 'vendor-bills':
          if (isEditing) {
            response = await financialService.updateVendorBill(initialData.id, {
              ...formData,
              total,
              items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price)
              }))
            });
          } else {
            response = await financialService.createVendorBill({
              ...formData,
              total,
              items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price)
              }))
            });
          }
          break;

        case 'expenses':
          if (isEditing) {
            response = await financialService.updateExpense(initialData.id, {
              ...formData,
              amount: parseFloat(formData.amount)
            });
          } else {
            response = await financialService.createExpense({
              ...formData,
              amount: parseFloat(formData.amount)
            });
          }
          break;

        default:
          throw new Error('Invalid document type');
      }

      if (response.success) {
        // Clear saved draft data after successful submission (only for create mode)
        const key = `financial_draft_${type}`;
        const itemsKey = `financial_items_${type}`;
        localStorage.removeItem(key);
        localStorage.removeItem(itemsKey);
        
        onSuccess();
      } else {
        setError(response.message || 'Failed to create document');
      }
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const isEditing = initialData && initialData.id;
    const prefix = isEditing ? 'Edit' : 'Create';
    
    const titles = {
      'sales-orders': `${prefix} Sales Order`,
      'purchase-orders': `${prefix} Purchase Order`,
      'vendor-bills': `${prefix} Vendor Bill`,
      'expenses': `${prefix} Expense`
    };
    return titles[type] || `${prefix} Document`;
  };

  const needsItems = ['sales-orders', 'purchase-orders', 'vendor-bills'].includes(type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              {getTitle()}
            </h3>
            {!initialData && (
              <button 
                type="button"
                onClick={handleClearForm}
                className="text-xs px-3 py-1 rounded border"
                style={{ 
                  color: 'rgb(var(--text-secondary))',
                  borderColor: 'rgb(var(--border))'
                }}
                title="Clear saved form data"
              >
                Clear Form
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-opacity-10 rounded"
            style={{ color: 'rgb(var(--text-secondary))' }}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="financial-form">
          {/* Sales Order Fields */}
          {type === 'sales-orders' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Customer Email
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Order Date *
                </label>
                <input
                  type="date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Delivery Date
                </label>
                <input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-1"></div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Customer Address
                </label>
                <input
                  type="text"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Terms & Conditions
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                />
              </div>
            </div>
          )}

          {/* Purchase Order Fields */}
          {type === 'purchase-orders' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Vendor Name *
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Vendor Email
                </label>
                <input
                  type="email"
                  name="vendor_email"
                  value={formData.vendor_email}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Order Date *
                </label>
                <input
                  type="date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Delivery Date
                </label>
                <input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-1"></div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Vendor Address
                </label>
                <input
                  type="text"
                  name="vendor_address"
                  value={formData.vendor_address}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Terms & Conditions
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                />
              </div>
            </div>
          )}

          {/* Vendor Bill Fields */}
          {type === 'vendor-bills' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Vendor Name *
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Payment Status
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Bill Date *
                </label>
                <input
                  type="date"
                  name="bill_date"
                  value={formData.bill_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="2"
                />
              </div>
            </div>
          )}

          {/* Expense Fields */}
          {type === 'expenses' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">-- Select Category --</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Software">Software</option>
                  <option value="Training">Training</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_billable"
                    checked={formData.is_billable}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    Billable to Client
                  </span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  rows="3"
                  required
                />
              </div>
            </div>
          )}

          {/* Line Items Section */}
          {needsItems && (
            <div className="border-t pt-6" style={{ borderColor: 'rgb(var(--border))' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                  Line Items
                </h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="input-field w-full text-sm"
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Qty
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="input-field w-full text-sm"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Unit Price
                      </label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="input-field w-full text-sm"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Total
                      </label>
                      <input
                        type="text"
                        value={`₹${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}`}
                        className="input-field w-full text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 hover:bg-red-50 rounded text-red-500"
                        disabled={items.length === 1}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: 'rgb(var(--border))' }}>
                <div className="text-right">
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }}>
                    ₹{calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center gap-3 p-6 pt-4 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="financial-form"
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading 
              ? (initialData?.id ? 'Updating...' : 'Creating...') 
              : (initialData?.id ? 'Update' : 'Create')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFinancialModal;
