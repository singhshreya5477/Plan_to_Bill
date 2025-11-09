const db = require('../config/db');

// ============================================
// SALES ORDERS
// ============================================

// Get all sales orders
exports.getSalesOrders = async (req, res) => {
    try {
        const { project_id, status } = req.query;
        
        let query = `
            SELECT 
                so.*,
                p.name as project_name,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM sales_orders so
            LEFT JOIN projects p ON so.project_id = p.id
            LEFT JOIN users u ON so.created_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (project_id) {
            query += ` AND so.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        if (status) {
            query += ` AND so.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        query += ` ORDER BY so.created_at DESC`;

        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get sales orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sales orders' });
    }
};

// Get sales order by ID with items
exports.getSalesOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const soResult = await db.query(`
            SELECT 
                so.*,
                p.name as project_name,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM sales_orders so
            LEFT JOIN projects p ON so.project_id = p.id
            LEFT JOIN users u ON so.created_by = u.id
            WHERE so.id = $1
        `, [id]);

        if (soResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sales order not found' });
        }

        const itemsResult = await db.query(`
            SELECT * FROM sales_order_items
            WHERE sales_order_id = $1
            ORDER BY id
        `, [id]);

        res.json({
            success: true,
            data: {
                ...soResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (error) {
        console.error('Get sales order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sales order' });
    }
};

// Create sales order
exports.createSalesOrder = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        const {
            customer_name,
            customer_email,
            customer_address,
            project_id,
            order_date,
            delivery_date,
            items,
            tax_rate,
            discount_amount,
            notes,
            terms
        } = req.body;

        // Generate SO number
        const countResult = await client.query('SELECT COUNT(*) FROM sales_orders');
        const count = parseInt(countResult.rows[0].count) + 1;
        const so_number = `SO-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

        // Calculate totals
        let subtotal = 0;
        if (items && items.length > 0) {
            subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        }

        const tax_amount = subtotal * (tax_rate || 0) / 100;
        const total = subtotal + tax_amount - (discount_amount || 0);

        // Create sales order
        const soResult = await client.query(`
            INSERT INTO sales_orders (
                so_number, project_id, customer_name, customer_email, customer_address,
                order_date, delivery_date, subtotal, tax_rate, tax_amount, 
                discount_amount, total, notes, terms, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            so_number, project_id, customer_name, customer_email, customer_address,
            order_date, delivery_date, subtotal, tax_rate || 0, tax_amount,
            discount_amount || 0, total, notes, terms, req.user.userId
        ]);

        const sales_order_id = soResult.rows[0].id;

        // Add items
        if (items && items.length > 0) {
            for (const item of items) {
                const amount = item.quantity * item.unit_price;
                await client.query(`
                    INSERT INTO sales_order_items (sales_order_id, description, quantity, unit_price, amount)
                    VALUES ($1, $2, $3, $4, $5)
                `, [sales_order_id, item.description, item.quantity, item.unit_price, amount]);
            }
        }

        await client.query('COMMIT');

        // Fetch complete SO
        const result = await exports.getSalesOrderByIdInternal(sales_order_id, client);
        
        res.status(201).json({
            success: true,
            message: 'Sales order created successfully',
            data: result
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create sales order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create sales order' });
    } finally {
        client.release();
    }
};

// Helper function
exports.getSalesOrderByIdInternal = async (id, client) => {
    const soResult = await client.query('SELECT * FROM sales_orders WHERE id = $1', [id]);
    const itemsResult = await client.query('SELECT * FROM sales_order_items WHERE sales_order_id = $1', [id]);
    
    return {
        ...soResult.rows[0],
        items: itemsResult.rows
    };
};

// Update sales order
exports.updateSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            customer_name,
            customer_email,
            customer_address,
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
        if (!customer_name || !order_date || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Customer name, order date, and at least one item are required'
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

            // Update sales order
            const soResult = await db.query(`
                UPDATE sales_orders 
                SET customer_name = $1,
                    customer_email = $2,
                    customer_address = $3,
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
                customer_name,
                customer_email || null,
                customer_address || null,
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

            if (soResult.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Sales order not found'
                });
            }

            // Delete existing items
            await db.query('DELETE FROM sales_order_items WHERE sales_order_id = $1', [id]);

            // Insert updated items
            for (const item of items) {
                const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
                await db.query(`
                    INSERT INTO sales_order_items 
                    (sales_order_id, description, quantity, unit_price, amount)
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

            // Fetch complete updated sales order with items
            const itemsResult = await db.query(
                'SELECT * FROM sales_order_items WHERE sales_order_id = $1 ORDER BY id',
                [id]
            );

            res.json({
                success: true,
                message: 'Sales order updated successfully',
                data: {
                    ...soResult.rows[0],
                    items: itemsResult.rows
                }
            });

        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }

    } catch (error) {
        console.error('Update sales order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update sales order'
        });
    }
};

// Update sales order status
exports.updateSalesOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(`
            UPDATE sales_orders 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sales order not found' });
        }

        res.json({
            success: true,
            message: 'Sales order status updated',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update sales order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update sales order' });
    }
};

// Delete sales order
exports.deleteSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if linked to invoice
        const invoiceCheck = await db.query(
            'SELECT id FROM invoices WHERE sales_order_id = $1',
            [id]
        );

        if (invoiceCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete sales order that is linked to an invoice'
            });
        }

        await db.query('DELETE FROM sales_orders WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Sales order deleted successfully'
        });
    } catch (error) {
        console.error('Delete sales order error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete sales order' });
    }
};
