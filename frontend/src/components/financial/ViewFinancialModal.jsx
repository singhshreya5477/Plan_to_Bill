import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';

const ViewFinancialModal = ({ item, onClose, onEdit }) => {
  if (!item) return null;

  const renderSalesOrderView = () => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-6 p-6 rounded-lg border" style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--bg-secondary))' }}>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>SO Number</p>
          <p className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>{item.so_number}</p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Status</p>
          <span className="px-3 py-1 rounded-full text-sm capitalize inline-block" style={{
            backgroundColor: getStatusColor(item.status),
            color: getStatusTextColor(item.status)
          }}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Customer Details */}
      <div>
        <h4 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Customer Information</h4>
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Name</p>
            <p style={{ color: 'rgb(var(--text-primary))' }}>{item.customer_name}</p>
          </div>
          {item.customer_email && (
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Email</p>
              <p style={{ color: 'rgb(var(--text-primary))' }}>{item.customer_email}</p>
            </div>
          )}
          {item.customer_address && (
            <div className="col-span-2">
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Address</p>
              <p style={{ color: 'rgb(var(--text-primary))' }}>{item.customer_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div>
        <h4 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Dates</h4>
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Order Date</p>
            <p style={{ color: 'rgb(var(--text-primary))' }}>{new Date(item.order_date).toLocaleDateString()}</p>
          </div>
          {item.delivery_date && (
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Delivery Date</p>
              <p style={{ color: 'rgb(var(--text-primary))' }}>{new Date(item.delivery_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      {item.items && item.items.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Line Items</h4>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'rgb(var(--border))' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                <tr>
                  <th className="text-left p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Description</th>
                  <th className="text-right p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Qty</th>
                  <th className="text-right p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Unit Price</th>
                  <th className="text-right p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {item.items.map((lineItem, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="p-3" style={{ color: 'rgb(var(--text-primary))' }}>{lineItem.description}</td>
                    <td className="p-3 text-right" style={{ color: 'rgb(var(--text-primary))' }}>{lineItem.quantity}</td>
                    <td className="p-3 text-right" style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(lineItem.unit_price).toFixed(2)}</td>
                    <td className="p-3 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(lineItem.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--border))' }}>
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'rgb(var(--text-secondary))' }}>Subtotal:</span>
              <span style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(item.subtotal || 0).toFixed(2)}</span>
            </div>
            {item.tax_rate > 0 && (
              <div className="flex justify-between">
                <span style={{ color: 'rgb(var(--text-secondary))' }}>Tax ({item.tax_rate}%):</span>
                <span style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(item.tax_amount || 0).toFixed(2)}</span>
              </div>
            )}
            {item.discount_amount > 0 && (
              <div className="flex justify-between">
                <span style={{ color: 'rgb(var(--text-secondary))' }}>Discount:</span>
                <span style={{ color: 'rgb(var(--text-primary))' }}>-₹{parseFloat(item.discount_amount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-semibold text-lg" style={{ borderColor: 'rgb(var(--border))' }}>
              <span style={{ color: 'rgb(var(--text-primary))' }}>Total:</span>
              <span style={{ color: 'rgb(var(--primary))' }}>₹{parseFloat(item.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(item.notes || item.terms) && (
        <div className="grid grid-cols-1 gap-4">
          {item.notes && (
            <div>
              <p className="text-sm mb-1 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Notes</p>
              <p className="p-3 rounded border" style={{ color: 'rgb(var(--text-primary))', borderColor: 'rgb(var(--border))' }}>{item.notes}</p>
            </div>
          )}
          {item.terms && (
            <div>
              <p className="text-sm mb-1 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Terms & Conditions</p>
              <p className="p-3 rounded border" style={{ color: 'rgb(var(--text-primary))', borderColor: 'rgb(var(--border))' }}>{item.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPurchaseOrderView = () => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-6 p-6 rounded-lg border" style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--bg-secondary))' }}>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>PO Number</p>
          <p className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>{item.po_number}</p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Status</p>
          <span className="px-3 py-1 rounded-full text-sm capitalize inline-block" style={{
            backgroundColor: getStatusColor(item.status),
            color: getStatusTextColor(item.status)
          }}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Vendor Details */}
      <div>
        <h4 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Vendor Information</h4>
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Name</p>
            <p style={{ color: 'rgb(var(--text-primary))' }}>{item.vendor_name}</p>
          </div>
          {item.vendor_email && (
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Email</p>
              <p style={{ color: 'rgb(var(--text-primary))' }}>{item.vendor_email}</p>
            </div>
          )}
          {item.vendor_address && (
            <div className="col-span-2">
              <p className="text-sm mb-1" style={{ color: 'rgb(--text-secondary))' }}>Address</p>
              <p style={{ color: 'rgb(var(--text-primary))' }}>{item.vendor_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar structure to Sales Order for Dates, Line Items, Totals, Notes */}
      <div>
        <h4 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Dates</h4>
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Order Date</p>
            <p style={{ color: 'rgb(var(--text-primary))' }}>{new Date(item.order_date).toLocaleDateString()}</p>
          </div>
          {item.delivery_date && (
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Delivery Date</p>
              <p style={{ color: 'rgb(var(--text-primary))' }}>{new Date(item.delivery_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items and Totals same as Sales Order */}
      {item.items && item.items.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>Line Items</h4>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'rgb(var(--border))' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                <tr>
                  <th className="text-left p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Description</th>
                  <th className="text-right p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Qty</th>
                  <th className="text-right p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Unit Price</th>
                  <th className="text-right p-3 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {item.items.map((lineItem, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="p-3" style={{ color: 'rgb(var(--text-primary))' }}>{lineItem.description}</td>
                    <td className="p-3 text-right" style={{ color: 'rgb(var(--text-primary))' }}>{lineItem.quantity}</td>
                    <td className="p-3 text-right" style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(lineItem.unit_price).toFixed(2)}</td>
                    <td className="p-3 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(lineItem.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--border))' }}>
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'rgb(var(--text-secondary))' }}>Subtotal:</span>
              <span style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(item.subtotal || 0).toFixed(2)}</span>
            </div>
            {item.tax_rate > 0 && (
              <div className="flex justify-between">
                <span style={{ color: 'rgb(var(--text-secondary))' }}>Tax ({item.tax_rate}%):</span>
                <span style={{ color: 'rgb(var(--text-primary))' }}>₹{parseFloat(item.tax_amount || 0).toFixed(2)}</span>
              </div>
            )}
            {item.discount_amount > 0 && (
              <div className="flex justify-between">
                <span style={{ color: 'rgb(var(--text-secondary))' }}>Discount:</span>
                <span style={{ color: 'rgb(var(--text-primary))' }}>-₹{parseFloat(item.discount_amount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-semibold text-lg" style={{ borderColor: 'rgb(var(--border))' }}>
              <span style={{ color: 'rgb(var(--text-primary))' }}>Total:</span>
              <span style={{ color: 'rgb(var(--primary))' }}>₹{parseFloat(item.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {(item.notes || item.terms) && (
        <div className="grid grid-cols-1 gap-4">
          {item.notes && (
            <div>
              <p className="text-sm mb-1 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Notes</p>
              <p className="p-3 rounded border" style={{ color: 'rgb(var(--text-primary))', borderColor: 'rgb(var(--border))' }}>{item.notes}</p>
            </div>
          )}
          {item.terms && (
            <div>
              <p className="text-sm mb-1 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Terms & Conditions</p>
              <p className="p-3 rounded border" style={{ color: 'rgb(var(--text-primary))', borderColor: 'rgb(var(--border))' }}>{item.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderExpenseView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Category</p>
          <p className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{item.category}</p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Amount</p>
          <p className="font-semibold text-lg" style={{ color: 'rgb(var(--primary))' }}>₹{parseFloat(item.amount).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Date</p>
          <p style={{ color: 'rgb(var(--text-primary))' }}>{new Date(item.expense_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Billable</p>
          <span className={`px-3 py-1 rounded-full text-sm ${item.is_billable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {item.is_billable ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="col-span-2">
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Description</p>
          <p className="p-3 rounded border" style={{ color: 'rgb(var(--text-primary))', borderColor: 'rgb(var(--border))' }}>{item.description}</p>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      draft: 'rgb(107 114 128 / 0.1)',
      sent: 'rgb(59 130 246 / 0.1)',
      approved: 'rgb(16 185 129 / 0.1)',
      pending: 'rgb(251 191 36 / 0.1)',
      paid: 'rgb(16 185 129 / 0.1)',
      unpaid: 'rgb(239 68 68 / 0.1)',
      cancelled: 'rgb(239 68 68 / 0.1)'
    };
    return colors[status] || 'rgb(107 114 128 / 0.1)';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      draft: 'rgb(107 114 128)',
      sent: 'rgb(59 130 246)',
      approved: 'rgb(16 185 129)',
      pending: 'rgb(251 191 36)',
      paid: 'rgb(16 185 129)',
      unpaid: 'rgb(239 68 68)',
      cancelled: 'rgb(239 68 68)'
    };
    return colors[status] || 'rgb(107 114 128)';
  };

  const getTitle = () => {
    const titles = {
      'sales-orders': 'Sales Order Details',
      'purchase-orders': 'Purchase Order Details',
      'vendor-bills': 'Vendor Bill Details',
      'expenses': 'Expense Details'
    };
    return titles[item.type] || 'Document Details';
  };

  const renderContent = () => {
    switch (item.type) {
      case 'sales-orders':
        return renderSalesOrderView();
      case 'purchase-orders':
        return renderPurchaseOrderView();
      case 'expenses':
        return renderExpenseView();
      default:
        return <p>Unsupported document type</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {getTitle()}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit && onEdit()}
              className="btn-secondary flex items-center gap-2"
            >
              Edit
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-opacity-10 rounded"
              style={{ color: 'rgb(var(--text-secondary))' }}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Download PDF
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
          </div>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFinancialModal;
