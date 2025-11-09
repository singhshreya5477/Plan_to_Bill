const db = require('../config/db');

// ============================================
// PURCHASE ORDERS
// ============================================

// Get all purchase orders
exports.getPurchaseOrders = async (req, res) => {
    try {
        const { project_id, status } = req.query;
        
        let query = `
            SELECT 
                po.*,
                p.name as project_name,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM purchase_orders po
            LEFT JOIN projects p ON po.project_id = p.id
            LEFT JOIN users u ON po.created_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (project_id) {
            query += ` AND po.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        if (status) {
            query += ` AND po.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        query += ` ORDER BY po.created_at DESC`;

        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get purchase orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchase orders' });
    }
};

// Get purchase order by ID with items
exports.getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const poResult = await db.query(`
            SELECT 
                po.*,
                p.name as project_name,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM purchase_orders po
            LEFT JOIN projects p ON po.project_id = p.id
            LEFT JOIN users u ON po.created_by = u.id
            WHERE po.id = $1
        `, [id]);

        if (poResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Purchase order not found' });
        }

        const itemsResult = await db.query(`
            SELECT * FROM purchase_order_items
            WHERE purchase_order_id = $1
            ORDER BY id
        `, [id]);

        res.json({
            success: true,
            data: {
                ...poResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        console.error('Get purchase order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchase order' });
    }
};

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        const {
            vendor_name,
            vendor_email,
            vendor_address,
            project_id,
            order_date,
            expected_delivery_date,
            items,
            tax_rate,
            discount_amount,
            notes,
            terms
        } = req.body;

        // Generate PO number
        const countResult = await client.query('SELECT COUNT(*) FROM purchase_orders');
        const count = parseInt(countResult.rows[0].count) + 1;
        const po_number = `PO-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

        // Calculate totals
        let subtotal = 0;
        if (items && items.length > 0) {
            subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        }

        const tax_amount = subtotal * (tax_rate || 0) / 100;
        const total = subtotal + tax_amount - (discount_amount || 0);

        // Create purchase order
        const poResult = await client.query(`
            INSERT INTO purchase_orders (
                po_number, project_id, vendor_name, vendor_email, vendor_address,
                order_date, expected_delivery_date, subtotal, tax_rate, tax_amount, 
                discount_amount, total, notes, terms, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            po_number, project_id, vendor_name, vendor_email, vendor_address,
            order_date, expected_delivery_date, subtotal, tax_rate || 0, tax_amount,
            discount_amount || 0, total, notes, terms, req.user.userId
        ]);

        const purchase_order_id = poResult.rows[0].id;

        // Add items
        if (items && items.length > 0) {
            for (const item of items) {
                const amount = item.quantity * item.unit_price;
                await client.query(`
                    INSERT INTO purchase_order_items (purchase_order_id, description, quantity, unit_price, amount)
                    VALUES ($1, $2, $3, $4, $5)
                `, [purchase_order_id, item.description, item.quantity, item.unit_price, amount]);
            }
        }

        await client.query('COMMIT');

        // Fetch complete PO
        const itemsResult = await client.query('SELECT * FROM purchase_order_items WHERE purchase_order_id = $1', [purchase_order_id]);
        
        res.status(201).json({
            success: true,
            message: 'Purchase order created successfully',
            data: {
                ...poResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create purchase order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create purchase order' });
    } finally {
        client.release();
    }
};

// Update purchase order
exports.updatePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            vendor_name,
            vendor_email,
            vendor_address,
            order_date,
            delivery_date,
            items,
            tax_rate = 0,
            discount_amount = 0,
            notes,
            terms,
            status
        } = req.body;

        // Validate required fields
        if (!vendor_name || !order_date || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vendor name, order date, and at least one item are required'
            });
        }

        await db.query('BEGIN');

        try {
            // Calculate totals
            let subtotal = 0;
            items.forEach(item => {
                const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
                subtotal += amount;
            });

            const taxAmount = (subtotal * parseFloat(tax_rate)) / 100;
            const total = subtotal + taxAmount - parseFloat(discount_amount);

            // Update purchase order
            const poResult = await db.query(`
                UPDATE purchase_orders 
                SET vendor_name = $1,
                    vendor_email = $2,
                    vendor_address = $3,
                    order_date = $4,
                    delivery_date = $5,
                    subtotal = $6,
                    tax_rate = $7,
                    tax_amount = $8,
                    discount_amount = $9,
                    total = $10,
                    notes = $11,
                    terms = $12,
                    status = $13,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $14
                RETURNING *
            `, [
                vendor_name,
                vendor_email || null,
                vendor_address || null,
                order_date,
                delivery_date || null,
                subtotal,
                tax_rate,
                taxAmount,
                discount_amount,
                total,
                notes || null,
                terms || null,
                status || 'draft',
                id
            ]);

            if (poResult.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Purchase order not found'
                });
            }

            // Delete existing items
            await db.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);

            // Insert updated items
            for (const item of items) {
                const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
                await db.query(`
                    INSERT INTO purchase_order_items 
                    (purchase_order_id, description, quantity, unit_price, amount)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    id,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    amount
                ]);
            }

            await db.query('COMMIT');

            // Fetch complete updated purchase order with items
            const itemsResult = await db.query(
                'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1 ORDER BY id',
                [id]
            );

            res.json({
                success: true,
                message: 'Purchase order updated successfully',
                data: {
                    ...poResult.rows[0],
                    items: itemsResult.rows
                }
            });

        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }

    } catch (error) {
        console.error('Update purchase order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update purchase order'
        });
    }
};

// Update purchase order status
exports.updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(`
            UPDATE purchase_orders 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Purchase order not found' });
        }

        res.json({
            success: true,
            message: 'Purchase order status updated',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update purchase order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update purchase order' });
    }
};

// Delete purchase order
exports.deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if linked to vendor bill
        const billCheck = await db.query(
            'SELECT id FROM vendor_bills WHERE purchase_order_id = $1',
            [id]
        );

        if (billCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete purchase order that is linked to a vendor bill'
            });
        }

        await db.query('DELETE FROM purchase_orders WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Purchase order deleted successfully'
        });
    } catch (error) {
        console.error('Delete purchase order error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete purchase order' });
    }
};
