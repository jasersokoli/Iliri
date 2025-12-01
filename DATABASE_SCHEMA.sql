-- Iliri Inventory Management System - Database Schema
-- PostgreSQL Recommended
-- This schema supports all current features plus new requirements:
-- - Payment history tracking
-- - Last used price per customer-article combination
-- - Mass deletion of sales
-- - Enhanced search capabilities

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code1 VARCHAR(100) NOT NULL,
    code2 VARCHAR(100),
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    minimum_stock DECIMAL(10, 2) DEFAULT 0,
    price1 DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price2 DECIMAL(10, 2),
    price3 DECIMAL(10, 2),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    active BOOLEAN DEFAULT true,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code1)
);

-- ============================================
-- TRANSACTION TABLES
-- ============================================

-- Purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name VARCHAR(255) NOT NULL, -- Denormalized for historical accuracy
    username VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase items table
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE RESTRICT,
    article_code VARCHAR(100) NOT NULL, -- Denormalized
    article_name VARCHAR(255) NOT NULL, -- Denormalized
    unit_cost DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    client_name VARCHAR(255) NOT NULL, -- Denormalized for historical accuracy
    client_reference VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    paid BOOLEAN DEFAULT false,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sale items table
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE RESTRICT,
    article_code VARCHAR(100) NOT NULL, -- Denormalized
    article_name VARCHAR(255) NOT NULL, -- Denormalized
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('Price 1', 'Price 2', 'Price 3', 'Custom')),
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NEW REQUIREMENTS TABLES
-- ============================================

-- Payments table (NEW: Payment history tracking)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Client-Article Price History (NEW: Last used price per customer-article)
CREATE TABLE client_article_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    last_price DECIMAL(10, 2) NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('Price 1', 'Price 2', 'Price 3', 'Custom')),
    last_used_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id, article_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Low Stock', 'System Alert', 'Payment Due', 'Other')),
    description TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Articles indexes (for search suggestions)
CREATE INDEX idx_articles_code1 ON articles(code1);
CREATE INDEX idx_articles_code2 ON articles(code2) WHERE code2 IS NOT NULL;
CREATE INDEX idx_articles_name ON articles(name);
CREATE INDEX idx_articles_active ON articles(active) WHERE active = true;
CREATE INDEX idx_articles_supplier ON articles(supplier_id);

-- Suppliers indexes
CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_active ON suppliers(active) WHERE active = true;

-- Clients indexes
CREATE INDEX idx_clients_code ON clients(code);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_active ON clients(active) WHERE active = true;

-- Purchases indexes
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_purchases_number ON purchases(number);

-- Purchase items indexes
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_article ON purchase_items(article_id);

-- Sales indexes
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_number ON sales(number);
CREATE INDEX idx_sales_paid ON sales(paid) WHERE paid = false;

-- Sale items indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_article ON sale_items(article_id);

-- Payments indexes (NEW)
CREATE INDEX idx_payments_sale ON payments(sale_id);
CREATE INDEX idx_payments_timestamp ON payments(timestamp);

-- Client-Article prices indexes (NEW)
CREATE INDEX idx_client_article_prices_client ON client_article_prices(client_id);
CREATE INDEX idx_client_article_prices_article ON client_article_prices(article_id);
CREATE INDEX idx_client_article_prices_composite ON client_article_prices(client_id, article_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to update stock after purchase
CREATE OR REPLACE FUNCTION update_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE articles
    SET current_stock = current_stock + NEW.quantity,
        cost = NEW.unit_cost, -- Update cost to latest purchase price
        updated_at = NOW()
    WHERE id = NEW.article_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_stock_after_purchase
    AFTER INSERT ON purchase_items
    FOR EACH ROW EXECUTE FUNCTION update_stock_after_purchase();

-- Function to update stock after sale
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE articles
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.article_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_stock_after_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW EXECUTE FUNCTION update_stock_after_sale();

-- Function to restore stock when sale is deleted
CREATE OR REPLACE FUNCTION restore_stock_after_sale_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE articles
    SET current_stock = current_stock + OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.article_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_restore_stock_after_sale_delete
    AFTER DELETE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION restore_stock_after_sale_delete();

-- Function to update last used price when sale is created
CREATE OR REPLACE FUNCTION update_client_article_price()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO client_article_prices (client_id, article_id, last_price, price_type, last_used_at)
    VALUES (
        (SELECT client_id FROM sales WHERE id = NEW.sale_id),
        NEW.article_id,
        NEW.unit_price,
        NEW.price_type,
        NOW()
    )
    ON CONFLICT (client_id, article_id)
    DO UPDATE SET
        last_price = EXCLUDED.last_price,
        price_type = EXCLUDED.price_type,
        last_used_at = EXCLUDED.last_used_at,
        updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_client_article_price
    AFTER INSERT ON sale_items
    FOR EACH ROW EXECUTE FUNCTION update_client_article_price();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Dashboard analytics view
CREATE OR REPLACE VIEW dashboard_analytics AS
SELECT
    COUNT(DISTINCT s.id) FILTER (WHERE s.paid = true) as total_sales,
    COALESCE(SUM(s.total) FILTER (WHERE s.paid = true), 0) as total_revenue,
    COALESCE(SUM(s.total) FILTER (WHERE s.paid = true), 0) - 
    COALESCE(SUM(
        (SELECT SUM(si.quantity * a.cost)
         FROM sale_items si
         JOIN articles a ON si.article_id = a.id
         WHERE si.sale_id = s.id)
    ) FILTER (WHERE s.paid = true), 0) as total_profit,
    COALESCE(SUM(s.total - COALESCE(s.paid_amount, 0)) FILTER (WHERE s.paid = false), 0) as total_debt,
    COALESCE(SUM(a.current_stock * a.cost), 0) as inventory_value
FROM sales s
CROSS JOIN articles a;

-- Top products view
CREATE OR REPLACE VIEW top_products AS
SELECT
    si.article_id,
    si.article_name,
    SUM(si.quantity) as quantity_sold
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE s.paid = true
GROUP BY si.article_id, si.article_name
ORDER BY quantity_sold DESC
LIMIT 10;

-- Active clients view
CREATE OR REPLACE VIEW active_clients AS
SELECT
    s.client_id,
    s.client_name,
    COUNT(DISTINCT s.id) as total_purchases
FROM sales s
GROUP BY s.client_id, s.client_name
ORDER BY total_purchases DESC
LIMIT 10;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a default admin user (password should be hashed in production)
-- Password: 'password123' (hash this properly in your application)
-- INSERT INTO users (name, email, password_hash) 
-- VALUES ('admin', 'admin@iliri.com', '$2b$10$...'); -- Use bcrypt or similar

-- ============================================
-- NOTES
-- ============================================

-- 1. All monetary values use DECIMAL(10,2) for precision
-- 2. UUIDs are used for all primary keys for better distribution
-- 3. Denormalized fields (supplier_name, client_name, article_name) preserve historical data
-- 4. Soft deletes are supported via 'deleted' flag on articles
-- 5. Timestamps are automatically managed via triggers
-- 6. Stock updates are handled automatically via triggers
-- 7. Last used prices are automatically tracked via triggers

-- ============================================
-- MIGRATION NOTES
-- ============================================

-- When migrating from localStorage:
-- 1. Export all data from localStorage
-- 2. Transform to match this schema
-- 3. Import using COPY or INSERT statements
-- 4. Verify data integrity
-- 5. Update application to use API instead of localStorage

