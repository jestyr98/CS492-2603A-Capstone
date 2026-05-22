PRAGMA foreign_keys = ON;

-- Employees who can manage inventory and operations.
CREATE TABLE IF NOT EXISTS employees (
  employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  job_title TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  hourly_rate REAL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Authentication data for employees (never store plaintext passwords).
CREATE TABLE IF NOT EXISTS employee_credentials (
  employee_id INTEGER PRIMARY KEY,
  password_hash TEXT NOT NULL,
  hash_algorithm TEXT NOT NULL DEFAULT 'bcrypt',
  failed_login_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
  locked_until TEXT,
  password_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- Menu categories that group items shown in the app (Specials, Pizzas, etc.).
CREATE TABLE IF NOT EXISTS menu_categories (
  category_id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  category_name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Manager-editable menu catalog with base price and optional special pricing.
CREATE TABLE IF NOT EXISTS menu_items (
  menu_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price REAL NOT NULL CHECK (base_price >= 0),
  is_special INTEGER NOT NULL DEFAULT 0 CHECK (is_special IN (0, 1)),
  special_price REAL CHECK (special_price IS NULL OR special_price >= 0),
  special_start_at TEXT,
  special_end_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  last_updated_by_employee_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(category_id) ON DELETE CASCADE,
  FOREIGN KEY (last_updated_by_employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_items_category_item_name
  ON menu_items(category_id, item_name);

CREATE INDEX IF NOT EXISTS idx_menu_items_active
  ON menu_items(is_active);

CREATE INDEX IF NOT EXISTS idx_menu_items_is_special
  ON menu_items(is_special);

CREATE INDEX IF NOT EXISTS idx_employee_credentials_locked_until
  ON employee_credentials(locked_until);

-- Customer account/profile info captured from sign-in/profile flows.
CREATE TABLE IF NOT EXISTS customers (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

-- Authentication data for customers (never store plaintext passwords).
-- Store algorithm output strings (for example, bcrypt/argon2) and rotate over time.
CREATE TABLE IF NOT EXISTS customer_credentials (
  customer_id INTEGER PRIMARY KEY,
  password_hash TEXT NOT NULL,
  hash_algorithm TEXT NOT NULL DEFAULT 'bcrypt',
  failed_login_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
  locked_until TEXT,
  password_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Extended profile details separate from core login/contact columns.
CREATE TABLE IF NOT EXISTS customer_profiles (
  customer_id INTEGER PRIMARY KEY,
  favorite_order TEXT,
  dietary_preferences TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms')),
  date_of_birth TEXT,
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Optional addresses for delivery use cases.
CREATE TABLE IF NOT EXISTS customer_addresses (
  address_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  street_1 TEXT NOT NULL,
  street_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Customer order history for account pages and reporting.
CREATE TABLE IF NOT EXISTS customer_orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL,
  delivery_address_id INTEGER,
  order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled')),
  subtotal_amount REAL NOT NULL CHECK (subtotal_amount >= 0),
  tax_amount REAL NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  delivery_fee REAL NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  discount_amount REAL NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount REAL NOT NULL CHECK (total_amount >= 0),
  placed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_address_id) REFERENCES customer_addresses(address_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customer_order_items (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER,
  item_name_snapshot TEXT NOT NULL,
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total REAL NOT NULL CHECK (line_total >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES customer_orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customer_order_status_history (
  status_event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled')),
  changed_by_employee_id INTEGER,
  note TEXT,
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES customer_orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id
  ON customer_addresses(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_orders_customer_id
  ON customer_orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_orders_status
  ON customer_orders(status);

CREATE INDEX IF NOT EXISTS idx_customer_orders_placed_at
  ON customer_orders(placed_at);

CREATE INDEX IF NOT EXISTS idx_customer_order_items_order_id
  ON customer_order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_customer_order_status_history_order_id
  ON customer_order_status_history(order_id);

CREATE INDEX IF NOT EXISTS idx_customer_credentials_locked_until
  ON customer_credentials(locked_until);

CREATE TRIGGER IF NOT EXISTS trg_employees_updated_at
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
  UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE employee_id = OLD.employee_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_employee_credentials_password_updated_at
AFTER UPDATE OF password_hash ON employee_credentials
FOR EACH ROW
BEGIN
  UPDATE employee_credentials SET password_updated_at = CURRENT_TIMESTAMP WHERE employee_id = OLD.employee_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_menu_categories_updated_at
AFTER UPDATE ON menu_categories
FOR EACH ROW
BEGIN
  UPDATE menu_categories SET updated_at = CURRENT_TIMESTAMP WHERE category_id = OLD.category_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_menu_items_updated_at
AFTER UPDATE ON menu_items
FOR EACH ROW
BEGIN
  UPDATE menu_items SET updated_at = CURRENT_TIMESTAMP WHERE menu_item_id = OLD.menu_item_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_customers_updated_at
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
  UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE customer_id = OLD.customer_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_customer_orders_updated_at
AFTER UPDATE ON customer_orders
FOR EACH ROW
BEGIN
  UPDATE customer_orders SET updated_at = CURRENT_TIMESTAMP WHERE order_id = OLD.order_id;
END;
