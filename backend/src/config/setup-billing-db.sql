-- ============================================
-- Phase 2: Time Tracking & Billing Module
-- Database Schema Setup
-- ============================================

-- ============================================
-- 1. TIME LOGS TABLE
-- Track time spent on tasks/projects
-- ============================================
CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT,
    hours DECIMAL(10, 2) NOT NULL CHECK (hours > 0),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. BILLING RATES TABLE
-- Define billing rates for projects/users
-- ============================================
CREATE TABLE IF NOT EXISTS billing_rates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50), -- Optional: rate based on role (developer, designer, etc.)
    rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('hourly', 'fixed', 'daily')),
    rate DECIMAL(10, 2) NOT NULL CHECK (rate >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rate_config UNIQUE (project_id, user_id, role, effective_from)
);

-- ============================================
-- 3. INVOICES TABLE
-- Track invoices for projects
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_address TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    terms TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. INVOICE ITEMS TABLE
-- Line items for invoices
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    time_log_id INTEGER REFERENCES time_logs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. PAYMENTS TABLE
-- Track payments against invoices
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) CHECK (payment_method IN ('bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other')),
    transaction_id VARCHAR(100),
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Time Logs Indexes
CREATE INDEX IF NOT EXISTS idx_time_logs_user ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_project ON time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_task ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_time_logs_billable ON time_logs(is_billable);

-- Billing Rates Indexes
CREATE INDEX IF NOT EXISTS idx_billing_rates_project ON billing_rates(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_rates_user ON billing_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_rates_active ON billing_rates(is_active);

-- Invoices Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Invoice Items Indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_time_log ON invoice_items(time_log_id);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================
-- TRIGGERS for Auto-updating timestamps
-- ============================================

-- Time Logs Update Trigger
CREATE OR REPLACE FUNCTION update_time_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_time_logs_timestamp
    BEFORE UPDATE ON time_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_time_logs_timestamp();

-- Billing Rates Update Trigger
CREATE OR REPLACE FUNCTION update_billing_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_billing_rates_timestamp
    BEFORE UPDATE ON billing_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_rates_timestamp();

-- Invoices Update Trigger
CREATE OR REPLACE FUNCTION update_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoices_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_timestamp();

-- Payments Update Trigger
CREATE OR REPLACE FUNCTION update_payments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payments_timestamp
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_timestamp();

-- ============================================
-- TRIGGER to Calculate Invoice Item Amount
-- ============================================
CREATE OR REPLACE FUNCTION calculate_invoice_item_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.amount = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_invoice_item_amount
    BEFORE INSERT OR UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_item_amount();

-- ============================================
-- TRIGGER to Update Invoice Totals
-- ============================================
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(12, 2);
BEGIN
    -- Calculate subtotal from invoice items
    SELECT COALESCE(SUM(amount), 0)
    INTO v_subtotal
    FROM invoice_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Update invoice
    UPDATE invoices
    SET subtotal = v_subtotal,
        tax_amount = v_subtotal * (tax_rate / 100),
        total = v_subtotal + (v_subtotal * (tax_rate / 100)) - discount_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_totals_insert
    AFTER INSERT ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER trigger_update_invoice_totals_update
    AFTER UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER trigger_update_invoice_totals_delete
    AFTER DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- ============================================
-- TRIGGER to Auto-update Invoice Status
-- ============================================
CREATE OR REPLACE FUNCTION auto_update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid DECIMAL(12, 2);
    v_invoice_total DECIMAL(12, 2);
    v_invoice_due_date DATE;
BEGIN
    -- Get invoice details
    SELECT total, due_date
    INTO v_invoice_total, v_invoice_due_date
    FROM invoices
    WHERE id = NEW.invoice_id;
    
    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE invoice_id = NEW.invoice_id;
    
    -- Update invoice status
    UPDATE invoices
    SET status = CASE
        WHEN v_total_paid >= v_invoice_total THEN 'paid'
        WHEN status = 'draft' THEN status -- Don't change draft status
        WHEN CURRENT_DATE > v_invoice_due_date AND v_total_paid < v_invoice_total THEN 'overdue'
        ELSE 'sent'
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_invoice_status
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_invoice_status();

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- View: Time Log Summary by Project
CREATE OR REPLACE VIEW v_time_logs_by_project AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS user_name,
    COUNT(tl.id) AS log_count,
    SUM(tl.hours) AS total_hours,
    SUM(CASE WHEN tl.is_billable THEN tl.hours ELSE 0 END) AS billable_hours,
    SUM(CASE WHEN NOT tl.is_billable THEN tl.hours ELSE 0 END) AS non_billable_hours,
    SUM(CASE WHEN tl.is_billable THEN tl.hours * COALESCE(tl.hourly_rate, 0) ELSE 0 END) AS billable_amount
FROM time_logs tl
JOIN projects p ON tl.project_id = p.id
JOIN users u ON tl.user_id = u.id
GROUP BY p.id, p.name, u.id, u.first_name, u.last_name;

-- View: Invoice Summary
CREATE OR REPLACE VIEW v_invoice_summary AS
SELECT 
    i.id,
    i.invoice_number,
    i.project_id,
    p.name AS project_name,
    i.client_name,
    i.issue_date,
    i.due_date,
    i.status,
    i.total,
    i.currency,
    COALESCE(SUM(pay.amount), 0) AS paid_amount,
    i.total - COALESCE(SUM(pay.amount), 0) AS balance,
    CASE 
        WHEN COALESCE(SUM(pay.amount), 0) >= i.total THEN 'Paid'
        WHEN CURRENT_DATE > i.due_date AND i.status != 'paid' THEN 'Overdue'
        ELSE 'Outstanding'
    END AS payment_status
FROM invoices i
JOIN projects p ON i.project_id = p.id
LEFT JOIN payments pay ON i.id = pay.invoice_id
GROUP BY i.id, i.invoice_number, i.project_id, p.name, i.client_name, 
         i.issue_date, i.due_date, i.status, i.total, i.currency;

-- View: Revenue Analytics
CREATE OR REPLACE VIEW v_revenue_analytics AS
SELECT 
    DATE_TRUNC('month', i.issue_date) AS month,
    COUNT(i.id) AS invoice_count,
    SUM(i.total) AS total_invoiced,
    SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) AS total_paid,
    SUM(CASE WHEN i.status = 'overdue' THEN i.total ELSE 0 END) AS total_overdue,
    SUM(i.total) - SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) AS total_outstanding
FROM invoices i
GROUP BY DATE_TRUNC('month', i.issue_date)
ORDER BY month DESC;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Phase 2: Time Tracking & Billing database schema created successfully!';
    RAISE NOTICE '📊 Tables created: time_logs, billing_rates, invoices, invoice_items, payments';
    RAISE NOTICE '🔍 Views created: v_time_logs_by_project, v_invoice_summary, v_revenue_analytics';
END $$;
