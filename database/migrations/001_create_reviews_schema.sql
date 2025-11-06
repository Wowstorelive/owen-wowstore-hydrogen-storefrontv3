-- Create reviews schema for Hydrogen storefront
-- PostgreSQL migration for product reviews and images

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(255) NOT NULL,
    product_handle VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(500),
    description TEXT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Indexes for common queries
    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

-- Review images table (many-to-one with reviews)
CREATE TABLE IF NOT EXISTS review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Index for fetching images by review
    CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_handle ON product_reviews(product_handle);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for reviews with images (optimized for queries)
CREATE OR REPLACE VIEW reviews_with_images AS
SELECT
    pr.id,
    pr.product_id,
    pr.product_handle,
    pr.rating,
    pr.title,
    pr.description,
    pr.customer_name,
    pr.customer_email,
    pr.created_at,
    pr.updated_at,
    pr.deleted_at,
    COALESCE(
        json_agg(
            json_build_object('id', ri.id, 'url', ri.image_url)
        ) FILTER (WHERE ri.id IS NOT NULL),
        '[]'::json
    ) as images
FROM product_reviews pr
LEFT JOIN review_images ri ON pr.id = ri.review_id
WHERE pr.deleted_at IS NULL
GROUP BY pr.id;

-- Grant permissions for PostgREST (replace 'web_anon' with your role)
-- GRANT USAGE ON SCHEMA public TO web_anon;
-- GRANT SELECT, INSERT ON product_reviews TO web_anon;
-- GRANT SELECT, INSERT ON review_images TO web_anon;
-- GRANT SELECT ON reviews_with_images TO web_anon;
