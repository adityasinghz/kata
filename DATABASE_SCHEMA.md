# Database Schema - TrendMart BI Dashboard

## Overview
The TrendMart BI Dashboard uses **CSV files** as the primary data source. The system implements an ETL pipeline that loads, normalizes, and merges multiple CSV files into a unified data model. This design allows for easy migration to a relational database in the future.

## Data Sources (CSV Files)

### 1. `product_master.csv`
Product catalog information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `product_id` | VARCHAR | PK | Unique product identifier (e.g., "PROD001", "P001") |
| `name` | VARCHAR | NOT NULL | Product name |
| `category` | VARCHAR | | Product category (e.g., "Electronics", "Grocery") |
| `brand` | VARCHAR | | Brand name |
| `MRP` | DECIMAL(10,2) | | Maximum Retail Price |

**Sample Data:**
```csv
product_id,name,category,brand,MRP
P001,Everyday Atta 5kg,Grocery,FreshGrain,250.00
P002,Everyday Rice 10kg,Grocery,FreshGrain,450.00
```

### 2. `store_sales.csv`
Sales transaction data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `date` / `sale_date` | DATE | NOT NULL | Sale date (YYYY-MM-DD) |
| `store_name` | VARCHAR | FK | Store identifier |
| `product_id` | VARCHAR | FK | Product identifier (references product_master) |
| `quantity` / `quantity_sold` | INTEGER | NOT NULL | Units sold |
| `net_sales` / `net_sales_value` | DECIMAL(10,2) | NOT NULL | Total sales amount |

**Note:** Column names may vary (`date` vs `sale_date`, `quantity` vs `quantity_sold`). DataLoader normalizes these.

**Sample Data:**
```csv
date,store_name,product_id,quantity,net_sales
2023-12-02,Store_North_1,P001,220,53499.60
2023-12-15,Store_North_1,P001,233,56660.94
```

### 3. `store_budget.csv`
Budget allocation and spending data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `store_name` | VARCHAR | PK | Store identifier |
| `region` | VARCHAR | NOT NULL | Region name (North/South/East/West) |
| `annual_budget` | DECIMAL(12,2) | NOT NULL | Annual budget allocation |
| `spend_ytd` | DECIMAL(12,2) | NOT NULL | Year-to-date spending |

**Sample Data:**
```csv
store_name,region,annual_budget,spend_ytd
Store_North_1,North,150000.00,95000.00
Store_South_1,South,180000.00,120000.00
```

### 4. `store_inventory.csv`
Current inventory levels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `store_name` | VARCHAR | PK, FK | Store identifier |
| `product_id` | VARCHAR | PK, FK | Product identifier |
| `stock_level` | INTEGER | NOT NULL | Current stock level |

**Sample Data:**
```csv
store_name,product_id,stock_level
Store_North_1,P001,150
Store_North_1,P002,200
```

## Unified Data Model

The ETL pipeline merges all CSV files into a unified DataFrame with the following structure:

### Core Columns (from store_sales)
- `date`: Sale date
- `store_name`: Store identifier
- `product_id`: Product identifier
- `quantity`: Units sold
- `net_sales`: Sales amount

### Merged Columns (from product_master)
- `name`: Product name
- `category`: Product category
- `brand`: Brand name
- `MRP`: Maximum Retail Price

### Merged Columns (from store_budget)
- `region`: Region name
- `annual_budget`: Annual budget
- `spend_ytd`: Year-to-date spending

### Merged Columns (from store_inventory)
- `stock_level`: Current inventory level

### Derived Metrics (calculated)
- `budget_utilization_pct`: (spend_ytd / annual_budget) * 100
- `revenue_per_unit`: net_sales / quantity
- `year`: Extracted from date
- `month`: Extracted from date
- `day`: Extracted from date
- `weekday`: Day name (Monday, Tuesday, etc.)

## Data Relationships

```
product_master (product_id)
    ↓ (1:N)
store_sales (product_id)
    ↓ (N:1)
store_name
    ↓ (1:1)
store_budget (store_name)
    ↓ (1:N)
store_inventory (store_name, product_id)
```

## Data Flow

1. **Load Phase:** DataLoader reads CSV files from `data/` directory
2. **Normalize Phase:** Column names are normalized (sale_date → date)
3. **Merge Phase:** DataFrames are merged on common keys
4. **Enrich Phase:** Derived metrics are calculated
5. **Output Phase:** Unified DataFrame is available for analysis

## Future Database Migration

When migrating to a relational database (PostgreSQL/MySQL), the schema would be:

### Tables
- `products` (product_id PK, name, category, brand, MRP)
- `stores` (store_name PK, region, annual_budget, spend_ytd)
- `sales` (sale_id PK, date, store_name FK, product_id FK, quantity, net_sales)
- `inventory` (store_name FK, product_id FK, stock_level, PRIMARY KEY (store_name, product_id))

### Indexes
- `idx_sales_date`: On sales.date for time-series queries
- `idx_sales_store`: On sales.store_name for filtering
- `idx_sales_product`: On sales.product_id for product analysis

## Data Quality Considerations

- **Missing Values:** Handled with `.fillna()` operations
- **Data Types:** Automatic type conversion (date strings → datetime)
- **Duplicates:** Pandas handles duplicate keys in merges
- **Validation:** Column existence checks before processing
