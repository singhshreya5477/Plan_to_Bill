const db = require('../config/db');

// ============================================
// VENDOR BILLS
// ============================================

// Get all vendor bills
exports.getVendorBills = async (req, res) => {
    try {
        const { project_id, status, purchase_order_id } = req.query;
        
        let query = `
            SELECT 
                vb.*,
                p.name as project_name,
                po.po_number,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM vendor_bills vb
            LEFT JOIN projects p ON vb.project_id = p.id
            LEFT JOIN purchase_orders po ON vb.purchase_order_id = po.id
            LEFT JOIN users u ON vb.created_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (project_id) {
            query += ` AND vb.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        if (status) {
            query += ` AND vb.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (purchase_order_id) {
            query += ` AND vb.purchase_order_id = $${paramCount}`;
            params.push(purchase_order_id);
            paramCount++;
        }

        query += ` ORDER BY vb.created_at DESC`;

        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get vendor bills error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vendor bills' });
    }
};

// Get vendor bill by ID with items
exports.getVendorBillById = async (req, res) => {
    try {
        const { id } = req.params;

        const billResult = await db.query(`
            SELECT 
                vb.*,
                p.name as project_name,
                po.po_number,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM vendor_bills vb
            LEFT JOIN projects p ON vb.project_id = p.id
            LEFT JOIN purchase_orders po ON vb.purchase_order_id = po.id
            LEFT JOIN users u ON vb.created_by = u.id
            WHERE vb.id = $1
        `, [id]);

        if (billResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vendor bill not found' });
        }

        const itemsResult = await db.query(`
            SELECT * FROM vendor_bill_items
            WHERE vendor_bill_id = $1
            ORDER BY id
        `, [id]);

        res.json({
            success: true,
            data: {
                ...billResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        console.error('Get vendor bill error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vendor bill' });
    }
};

// Create vendor bill
exports.createVendorBill = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        const {
            vendor_name,
            vendor_email,
            vendor_address,
            project_id,
            purchase_order_id,
            bill_date,
            due_date,
            items,
            tax_rate,
            discount_amount,
            notes
        } = req.body;

        // Generate bill number
        const countResult = await client.query('SELECT COUNT(*) FROM vendor_bills');
        const count = parseInt(countResult.rows[0].count) + 1;
        const bill_number = `VB-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

        // Calculate totals
        let subtotal = 0;
        if (items && items.length > 0) {
            subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        }

        const tax_amount = subtotal * (tax_rate || 0) / 100;
        const total = subtotal + tax_amount - (discount_amount || 0);

        // Create vendor bill
        const billResult = await client.query(`
            INSERT INTO vendor_bills (
                bill_number, project_id, purchase_order_id, vendor_name, vendor_email, 
                vendor_address, bill_date, due_date, subtotal, tax_rate, tax_amount, 
                discount_amount, total, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            bill_number, project_id, purchase_order_id, vendor_name, vendor_email,
            vendor_address, bill_date, due_date, subtotal, tax_rate || 0, tax_amount,
            discount_amount || 0, total, notes, req.user.userId
        ]);

        const vendor_bill_id = billResult.rows[0].id;

        // Add items
        if (items && items.length > 0) {
            for (const item of items) {
                const amount = item.quantity * item.unit_price;
                await client.query(`
                    INSERT INTO vendor_bill_items (vendor_bill_id, description, quantity, unit_price, amount)
                    VALUES ($1, $2, $3, $4, $5)
                `, [vendor_bill_id, item.description, item.quantity, item.unit_price, amount]);
            }
        }

        await client.query('COMMIT');

        // Fetch complete bill
        const itemsResult = await client.query('SELECT * FROM vendor_bill_items WHERE vendor_bill_id = $1', [vendor_bill_id]);
        
        res.status(201).json({
            success: true,
            message: 'Vendor bill created successfully',
            data: {
                ...billResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create vendor bill error:', error);
        res.status(500).json({ success: false, message: 'Failed to create vendor bill' });
    } finally {
        client.release();
    }
};

// Update vendor bill
exports.updateVendorBill = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const {
            vendor_name,
            bill_date,
            due_date,
            items,
            payment_status,
            notes
        } = req.body;

        // Validate required fields
        if (!vendor_name || !bill_date || !due_date || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vendor name, bill date, due date, and at least one item are required'
            });
        }

        await client.query('BEGIN');

        // Calculate total
        let total = 0;
        items.forEach(item => {
            const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
            total += amount;
        });

        // Update vendor bill
        const billResult = await client.query(`
            UPDATE vendor_bills 
            SET vendor_name = $1,
                bill_date = $2,
                due_date = $3,
                total = $4,
                payment_status = $5,
                notes = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
        `, [
            vendor_name,
            bill_date,
            due_date,
            total,
            payment_status || 'unpaid',
            notes || null,
            id
        ]);

        if (billResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Vendor bill not found'
            });
        }

        // Delete existing items
        await client.query('DELETE FROM vendor_bill_items WHERE vendor_bill_id = $1', [id]);

        // Insert updated items
        for (const item of items) {
            const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
            await client.query(`
                INSERT INTO vendor_bill_items 
                (vendor_bill_id, description, quantity, unit_price, amount)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                id,
                item.description,
                item.quantity,
                item.unit_price,
                amount
            ]);
        }

        await client.query('COMMIT');

        // Fetch complete updated bill with items
        const itemsResult = await client.query(
            'SELECT * FROM vendor_bill_items WHERE vendor_bill_id = $1 ORDER BY id',
            [id]
        );

        res.json({
            success: true,
            message: 'Vendor bill updated successfully',
            data: {
                ...billResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update vendor bill error:', error);
        res.status(500).json({ success: false, message: 'Failed to update vendor bill' });
    } finally {
        client.release();
    }
};

// Update vendor bill status
exports.updateVendorBillStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(`
            UPDATE vendor_bills 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vendor bill not found' });
        }

        res.json({
            success: true,
            message: 'Vendor bill status updated',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update vendor bill status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update vendor bill' });
    }
};

// Delete vendor bill
exports.deleteVendorBill = async (req, res) => {
    try {
        const { id } = req.params;

        // Only allow deletion if pending or cancelled
        const bill = await db.query('SELECT status FROM vendor_bills WHERE id = $1', [id]);
        
        if (bill.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vendor bill not found' });
        }

        if (bill.rows[0].status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete paid vendor bill'
            });
        }

        await db.query('DELETE FROM vendor_bills WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Vendor bill deleted successfully'
        });
    } catch (error) {
        console.error('Delete vendor bill error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete vendor bill' });
    }
};
