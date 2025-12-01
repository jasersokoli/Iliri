# Database Recommendation for Iliri Inventory Management System

## Executive Summary

For hosting the Iliri inventory management system, I recommend **PostgreSQL** as the primary database choice. This document outlines the reasoning and provides alternative options based on your hosting environment and requirements.

## Recommended Database: PostgreSQL

### Why PostgreSQL?

1. **Relational Data Structure**
   - Your application has complex relationships:
     - Articles ↔ Suppliers
     - Articles ↔ Sales (many-to-many via SaleItems)
     - Articles ↔ Purchases (many-to-many via PurchaseItems)
     - Clients ↔ Sales
     - Payment history tracking (new requirement)
     - Last used price per customer-article combination (new requirement)
   - PostgreSQL excels at handling relational data with foreign keys, joins, and constraints

2. **ACID Compliance**
   - Critical for inventory management where stock updates must be atomic
   - Ensures data integrity when processing sales and purchases
   - Prevents race conditions in stock updates

3. **Advanced Features**
   - **JSON Support**: Can store flexible data structures if needed
   - **Full-Text Search**: For article name/code searches
   - **Triggers & Functions**: For automatic calculations (stock updates, analytics)
   - **Views**: For complex analytics queries
   - **Indexing**: Excellent performance for search operations

4. **Scalability**
   - Handles growing data volumes efficiently
   - Good performance with proper indexing
   - Supports concurrent users well

5. **Hosting Compatibility**
   - Supported by all major cloud providers:
     - AWS RDS PostgreSQL
     - Google Cloud SQL (PostgreSQL)
     - Azure Database for PostgreSQL
     - Heroku Postgres
     - DigitalOcean Managed Databases
     - Railway, Render, Vercel (with external DB)

6. **Cost-Effective**
   - Open-source (free)
   - Many managed hosting options with free tiers
   - Lower operational costs than proprietary databases

## Database Schema Overview

Based on your application structure, here's the recommended schema:

### Core Tables

1. **users** - User accounts and authentication
2. **articles** - Products/inventory items
3. **suppliers** - Supplier information
4. **clients** - Customer information
5. **purchases** - Purchase transactions
6. **purchase_items** - Individual items in purchases
7. **sales** - Sale transactions
8. **sale_items** - Individual items in sales
9. **payments** - Payment history (NEW requirement)
10. **notifications** - System notifications
11. **client_article_prices** - Last used price per customer-article (NEW requirement)

### Key Relationships

```
articles (1) ──< (many) purchase_items
articles (1) ──< (many) sale_items
articles (1) ──< (many) client_article_prices
suppliers (1) ──< (many) purchases
clients (1) ──< (many) sales
sales (1) ──< (many) payments
```

## Alternative Database Options

### Option 2: MySQL/MariaDB

**Pros:**
- Widely supported by hosting providers
- Good performance for read-heavy workloads
- Familiar to many developers
- Lower memory footprint

**Cons:**
- Less advanced features than PostgreSQL
- Weaker JSON support
- More limited full-text search

**Best for:** If you're already familiar with MySQL or have specific hosting constraints

### Option 3: SQLite (NOT Recommended for Production)

**Pros:**
- Zero configuration
- File-based, easy to backup
- Good for development/testing

**Cons:**
- Not suitable for concurrent writes
- Limited scalability
- No network access (single-server only)

**Use only for:** Development, testing, or very small single-user deployments

## Hosting Recommendations

### Cloud Database Services (Managed)

1. **Supabase** (Recommended for quick setup)
   - PostgreSQL with built-in REST API
   - Real-time subscriptions
   - Authentication included
   - Free tier available
   - Easy migration path

2. **AWS RDS PostgreSQL**
   - Enterprise-grade reliability
   - Automated backups
   - Multi-AZ for high availability
   - Pay-as-you-go pricing

3. **Google Cloud SQL (PostgreSQL)**
   - Integrated with Google Cloud services
   - Automatic backups
   - High availability options

4. **Railway / Render**
   - Simple setup
   - PostgreSQL add-on available
   - Good for small to medium deployments

### Self-Hosted Options

If you prefer self-hosting:
- **Docker + PostgreSQL**: Easy to deploy and manage
- **VPS with PostgreSQL**: More control, requires maintenance

## Implementation Considerations

### New Requirements Support

Based on the new requirements, your database needs to support:

1. **Payment History**
   ```sql
   CREATE TABLE payments (
     id UUID PRIMARY KEY,
     sale_id UUID REFERENCES sales(id),
     amount DECIMAL(10,2),
     timestamp TIMESTAMP DEFAULT NOW(),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Last Used Price Tracking**
   ```sql
   CREATE TABLE client_article_prices (
     id UUID PRIMARY KEY,
     client_id UUID REFERENCES clients(id),
     article_id UUID REFERENCES articles(id),
     last_price DECIMAL(10,2),
     price_type VARCHAR(20),
     last_used_at TIMESTAMP,
     UNIQUE(client_id, article_id)
   );
   ```

3. **Indexes for Performance**
   - Index on article codes for fast search
   - Index on article names for search suggestions
   - Index on sale dates for analytics
   - Composite indexes for common queries

### Migration Strategy

1. **Phase 1**: Set up PostgreSQL database
2. **Phase 2**: Create schema and tables
3. **Phase 3**: Build REST API backend (Node.js/Express, Python/FastAPI, or similar)
4. **Phase 4**: Update frontend to use API instead of localStorage
5. **Phase 5**: Migrate existing data (if any)

## Recommended Tech Stack for Backend

Since you're using React/TypeScript, consider:

1. **Node.js + Express + TypeScript**
   - Same language as frontend
   - TypeScript for type safety
   - Libraries: `pg` (PostgreSQL client), `prisma` or `typeorm` (ORM)

2. **Python + FastAPI**
   - Fast development
   - Excellent PostgreSQL support
   - Auto-generated API docs

3. **Supabase**
   - PostgreSQL + auto-generated REST API
   - Real-time subscriptions
   - Built-in authentication
   - Minimal backend code needed

## Cost Estimates

### Managed PostgreSQL (Monthly)

- **Supabase Free Tier**: $0 (up to 500MB database)
- **Supabase Pro**: ~$25/month
- **AWS RDS (db.t3.micro)**: ~$15-20/month
- **Railway**: ~$5-20/month (usage-based)
- **DigitalOcean**: ~$15/month (1GB RAM)

### Self-Hosted

- VPS: $5-20/month
- Database maintenance: Your time

## Security Considerations

1. **Connection Security**: Always use SSL/TLS for database connections
2. **Credentials**: Store database credentials in environment variables
3. **Backups**: Enable automated daily backups
4. **Access Control**: Use database users with minimal required permissions
5. **SQL Injection**: Use parameterized queries (ORMs handle this)

## Next Steps

1. **Choose hosting provider** based on budget and requirements
2. **Set up PostgreSQL database**
3. **Design and create database schema**
4. **Build backend API** to replace localStorage
5. **Update frontend** to consume API
6. **Test thoroughly** before production deployment

## Conclusion

**PostgreSQL is the recommended choice** for the Iliri inventory management system due to:
- Strong relational data support
- ACID compliance for data integrity
- Excellent performance and scalability
- Wide hosting provider support
- Advanced features for future growth

The investment in PostgreSQL will pay off as your application grows and requirements become more complex.

---

**Questions or need help with implementation?** Consider the database schema design and backend API development as the next critical steps.

