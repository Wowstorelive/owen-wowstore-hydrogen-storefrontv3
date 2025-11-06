-- ================================================
-- CMS Schema for Hydrogen Storefront
-- Replaces Sanity CMS with PostgreSQL
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. SETTINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS cms_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language VARCHAR(10) NOT NULL DEFAULT 'en',

    -- Header
    header_favicon_url TEXT,
    header_logo_url TEXT,
    header_logo_alt TEXT,
    header_logo_width INTEGER,
    header_logo_height INTEGER,
    header_logo_white_url TEXT,
    header_logo_white_alt TEXT,
    header_logo_white_width INTEGER,
    header_logo_white_height INTEGER,
    header_top_links JSONB DEFAULT '[]'::jsonb,

    -- Footer
    footer_column_links JSONB DEFAULT '[]'::jsonb,

    -- Search
    search_trending_links JSONB DEFAULT '[]'::jsonb,
    search_collection_links JSONB DEFAULT '[]'::jsonb,

    -- Countdown Timer
    countdown_status BOOLEAN DEFAULT false,
    countdown_title TEXT,
    countdown_subtitle TEXT,
    countdown_show_button BOOLEAN DEFAULT false,
    countdown_button_text TEXT,
    countdown_bg_color VARCHAR(7),
    countdown_text_color VARCHAR(7),
    countdown_button_bg_color VARCHAR(7),
    countdown_button_text_color VARCHAR(7),
    countdown_button_link JSONB,
    countdown_start TIMESTAMP WITH TIME ZONE,
    countdown_end TIMESTAMP WITH TIME ZONE,

    -- Newsletter
    newsletter_show_popup BOOLEAN DEFAULT false,
    newsletter_heading TEXT,
    newsletter_description TEXT,
    newsletter_bg_color VARCHAR(7),
    newsletter_text_color VARCHAR(7),
    newsletter_banner_url TEXT,
    newsletter_banner_alt TEXT,
    newsletter_banner_width INTEGER,
    newsletter_banner_height INTEGER,

    -- Social
    social_facebook TEXT,
    social_instagram TEXT,
    social_pinterest TEXT,
    social_twitter TEXT,
    social_youtube TEXT,

    -- Other
    size_guide TEXT,
    embed_code TEXT,
    other_address1 TEXT,
    other_address2 TEXT,
    other_email TEXT,
    other_phone_number TEXT,
    other_shipping_text TEXT,
    other_store_domain TEXT,
    other_store_name TEXT,
    other_payment_image_url TEXT,
    other_payment_image_alt TEXT,
    other_payment_image_width INTEGER,
    other_payment_image_height INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(language)
);

-- ================================================
-- 2. MENU TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS cms_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    position INTEGER NOT NULL DEFAULT 0,
    main_link JSONB,
    full_width BOOLEAN DEFAULT false,
    custom_width INTEGER,
    links_column INTEGER,
    dropdown_position VARCHAR(20),
    brand_section JSONB DEFAULT '[]'::jsonb,
    link_section JSONB DEFAULT '[]'::jsonb,
    promo_section JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. PAGES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type VARCHAR(50) NOT NULL, -- 'home', 'page', 'collection'
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    slug VARCHAR(255) NOT NULL,
    title TEXT,
    show_title BOOLEAN DEFAULT true,
    center_title BOOLEAN DEFAULT false,
    modules JSONB DEFAULT '[]'::jsonb,

    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_image_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(page_type, language, slug)
);

-- ================================================
-- 4. MEDIA LIBRARY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS cms_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_filename TEXT,
    url TEXT NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. STORE LOCATIONS TABLE (for store locator)
-- ================================================
CREATE TABLE IF NOT EXISTS cms_store_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    hours JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_cms_settings_language ON cms_settings(language);
CREATE INDEX IF NOT EXISTS idx_cms_menus_language ON cms_menus(language);
CREATE INDEX IF NOT EXISTS idx_cms_menus_position ON cms_menus(position);
CREATE INDEX IF NOT EXISTS idx_cms_pages_page_type ON cms_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_cms_pages_language ON cms_pages(language);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_media_filename ON cms_media(filename);
CREATE INDEX IF NOT EXISTS idx_cms_store_locations_city ON cms_store_locations(city);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_settings_updated_at BEFORE UPDATE ON cms_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_menus_updated_at BEFORE UPDATE ON cms_menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_media_updated_at BEFORE UPDATE ON cms_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_store_locations_updated_at BEFORE UPDATE ON cms_store_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- GRANT PERMISSIONS TO web_anon ROLE
-- ================================================
GRANT SELECT ON cms_settings TO web_anon;
GRANT SELECT ON cms_menus TO web_anon;
GRANT SELECT ON cms_pages TO web_anon;
GRANT SELECT ON cms_media TO web_anon;
GRANT SELECT ON cms_store_locations TO web_anon;

-- ================================================
-- INSERT DEFAULT DATA
-- ================================================

-- Default English settings
INSERT INTO cms_settings (language) VALUES ('en')
ON CONFLICT (language) DO NOTHING;

-- Default home page
INSERT INTO cms_pages (page_type, language, slug, title, seo_title, seo_description)
VALUES ('home', 'en', 'home', 'Home', 'Welcome to Our Store', 'Shop the latest products')
ON CONFLICT (page_type, language, slug) DO NOTHING;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE cms_settings IS 'Global site settings (header, footer, social, etc.)';
COMMENT ON TABLE cms_menus IS 'Navigation menu structure';
COMMENT ON TABLE cms_pages IS 'Page content with modular blocks';
COMMENT ON TABLE cms_media IS 'Media library for images and files';
COMMENT ON TABLE cms_store_locations IS 'Physical store locations for store locator';
