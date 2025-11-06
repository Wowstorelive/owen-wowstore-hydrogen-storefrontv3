-- Create returns schema for Hydrogen storefront
-- PostgreSQL migration for order returns management

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(255) NOT NULL,
    order_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Status can be: pending, approved, rejected, completed
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- Return line items table (items being returned)
CREATE TABLE IF NOT EXISTS return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    line_item_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255),
    product_title VARCHAR(500),
    variant_id VARCHAR(255),
    variant_title VARCHAR(500),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_return FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE
);

-- Return images table (photos of items being returned)
CREATE TABLE IF NOT EXISTS return_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_return_image FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer_email ON returns(customer_email);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_return_images_return_id ON return_images(return_id);

-- Create trigger for updated_at
CREATE TRIGGER update_returns_updated_at
    BEFORE UPDATE ON returns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for returns with all related data
CREATE OR REPLACE VIEW returns_with_details AS
SELECT
    r.id,
    r.order_id,
    r.order_name,
    r.customer_email,
    r.customer_name,
    r.reason,
    r.status,
    r.created_at,
    r.updated_at,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', ri.id,
                'lineItemId', ri.line_item_id,
                'productId', ri.product_id,
                'productTitle', ri.product_title,
                'variantId', ri.variant_id,
                'variantTitle', ri.variant_title,
                'quantity', ri.quantity,
                'reason', ri.reason
            )
        ) FILTER (WHERE ri.id IS NOT NULL),
        '[]'::json
    ) as items,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object('id', rim.id, 'url', rim.image_url)
        ) FILTER (WHERE rim.id IS NOT NULL),
        '[]'::json
    ) as images
FROM returns r
LEFT JOIN return_items ri ON r.id = ri.return_id
LEFT JOIN return_images rim ON r.id = rim.return_id
GROUP BY r.id;

-- Grant permissions for PostgREST
-- GRANT SELECT, INSERT, UPDATE ON returns TO web_anon;
-- GRANT SELECT, INSERT ON return_items TO web_anon;
-- GRANT SELECT, INSERT ON return_images TO web_anon;
-- GRANT SELECT ON returns_with_details TO web_anon;
