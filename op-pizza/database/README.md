# Database Starter (SQLite)

This folder provides a starter relational schema for:
- Employees
- Menu categories and menu items (manager editable)
- Inventory
- Customer profile data
- Employee credentials (secure password hashes)
- Customer credentials (secure password hashes)

## Files
- `schema.sql`: table definitions, constraints, indexes, triggers
- `seed.sql`: sample starter data for development/testing

## Data model summary
- `employees`: team members and roles
- `menu_categories`: menu section definitions shown to users
- `menu_items`: manager-editable item catalog with base and optional special pricing
- `employee_credentials`: password hash storage and login lockout counters for staff
- `inventory_items`: stock tracked by SKU
- `inventory_transactions`: all stock in/out events with optional employee attribution
- `customers`: core customer account/contact fields
- `customer_orders`: order header history including totals, status, and timing
- `customer_order_items`: line items saved per order with price snapshots
- `customer_order_status_history`: timeline of order status changes
- `customer_credentials`: password hash storage and login lockout counters
- `customer_profiles`: extended profile details (favorite order, preferences)
- `customer_addresses`: one-to-many customer delivery addresses

## Credential security rules
- Never store plaintext passwords.
- Hash passwords with a modern adaptive algorithm (recommended: Argon2id; acceptable: bcrypt).
- Compare password hashes using the library's secure verify function.
- Reset `failed_login_attempts` on successful login.
- Set `locked_until` after repeated failed attempts to reduce brute-force risk.

## Quick start
If sqlite3 is installed locally:

The seed script clears and repopulates the sample tables, so it is safe to rerun during development.

If PowerShell says sqlite3 is not recognized after installing with winget, close and reopen the terminal first. If it still is not on PATH, run the executable directly from the WinGet links folder:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Links\sqlite3.exe" --version
```

```powershell
cd op-pizza/database
sqlite3 op_pizza.db ".read schema.sql"
sqlite3 op_pizza.db ".read seed.sql"
sqlite3 op_pizza.db "SELECT customer_id, email, loyalty_points FROM customers;"
```