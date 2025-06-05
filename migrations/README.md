# Database Migrations

This directory contains all database schema migrations for the BudgetPlanner application.

## 📊 Database Schema Overview

The BudgetPlanner uses the following main tables:

- **`categories`** - User expense categories with colors and default budgets
- **`monthly_budgets`** - Monthly budget planning with income tracking
- **`budget_items`** - Planned amounts per category per month
- **`expenses`** - Individual expense records

## 🚀 Setup Options

### Option 1: Quick Setup (Recommended)

Use the complete schema file for fastest setup:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Execute the script

### Option 2: Step-by-Step Migration

Execute the migration files **in order**:

1. `001_create_categories.sql` - Create categories table
2. `002_create_monthly_budgets.sql` - Create monthly budgets table
3. `003_create_budget_items.sql` - Create budget items table (requires 1 & 2)
4. `004_create_expenses.sql` - Create expenses table (requires 1)
5. `005_setup_default_privileges.sql` - Configure permissions

### Option 3: Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations (if using supabase/migrations/ folder)
supabase db push
```

## 🔒 Security Features

All tables include:

- **Row Level Security (RLS)** - Users can only access their own data
- **User isolation** - Data is tied to `auth.uid()`
- **Proper foreign keys** - Data integrity constraints
- **Cascade deletes** - Clean up related data automatically
- **Smart permissions** - Secure access via relationships

## 📋 Migration Details

| File                               | Description                                 | Dependencies      |
| ---------------------------------- | ------------------------------------------- | ----------------- |
| `schema.sql`                       | **Complete schema** - All tables & policies | None (standalone) |
| `001_create_categories.sql`        | User expense categories                     | Supabase Auth     |
| `002_create_monthly_budgets.sql`   | Monthly budget planning                     | Supabase Auth     |
| `003_create_budget_items.sql`      | Budget allocations per category             | Tables 1 & 2      |
| `004_create_expenses.sql`          | Individual expense tracking                 | Table 1           |
| `005_setup_default_privileges.sql` | Permission configuration                    | All tables        |

## 🔍 Table Relationships

```
auth.users (Supabase Auth)
    │
    ├── categories
    │     └── expenses (category_id)
    │     └── budget_items (category_id)
    │
    └── monthly_budgets
          └── budget_items (monthly_budget_id)
```

## 🛠️ Local Development

### Creating Test Data

After running migrations, you can create sample data:

```sql
-- Insert sample category
INSERT INTO categories (name, default_budget, color)
VALUES ('Groceries', 400.00, '#10b981');

-- Insert monthly budget
INSERT INTO monthly_budgets (month, income)
VALUES ('2024-01', 3500.00);

-- Insert budget item
INSERT INTO budget_items (monthly_budget_id, category_id, planned_amount)
VALUES (1, 1, 400.00);

-- Insert sample expense
INSERT INTO expenses (category_id, amount, description, expense_date)
VALUES (1, 45.67, 'Supermarket shopping', '2024-01-15');
```

## ⚠️ Important Notes

- **Always backup** your database before applying migrations
- Run migrations in **numerical order** for step-by-step setup
- Each migration is **idempotent** (safe to run multiple times)
- **RLS policies** ensure data security between users
- **Foreign key constraints** maintain data integrity
- Use `schema.sql` for clean, new database setups

## 🔧 Troubleshooting

### Common Issues:

**"relation already exists"**

- Normal with `IF NOT EXISTS` statements
- Safe to ignore this message

**"permission denied"**

- Ensure you're connected to the correct Supabase project
- Check your role has sufficient permissions

**"foreign key constraint violation"**

- Ensure migrations run in correct order
- Verify all referenced tables exist

**"function auth.uid() does not exist"**

- Ensure Supabase Auth is enabled
- Run migrations in authenticated Supabase environment

## 🆕 Schema Updates

When updating the schema:

1. **Never modify existing migrations** - They should be immutable
2. **Create new migration files**: `006_add_new_feature.sql`
3. **Test thoroughly** on development database first
4. **Update this README** with new migration info
5. **Update schema.sql** to include all changes

## 📞 Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Verify your Supabase project settings
3. Create an issue in this repository with:
   - Error message
   - Migration step you're on
   - Your Supabase setup details
