PRAGMA foreign_keys = ON;

DELETE FROM customer_order_status_history;
DELETE FROM customer_order_items;
DELETE FROM customer_orders;
DELETE FROM customer_addresses;
DELETE FROM menu_item_ingredients;
DELETE FROM category_ingredients;
DELETE FROM ingredients;
DELETE FROM menu_items;
DELETE FROM menu_categories;
DELETE FROM employee_credentials;
DELETE FROM customer_credentials;
DELETE FROM customer_profiles;
DELETE FROM customers;
DELETE FROM employees;

DELETE FROM sqlite_sequence;

INSERT INTO employees (first_name, last_name, email, phone, job_title, hire_date, hourly_rate, status)
VALUES
  ('Maya', 'Lopez', 'maya.lopez@operationpizzeria.com', '803-555-1010', 'Store Manager', '2023-01-15', 24.50, 'active'),
  ('Chris', 'Bennett', 'chris.bennett@operationpizzeria.com', '803-555-1020', 'Kitchen Lead', '2023-03-10', 21.00, 'active'),
  ('Ivy', 'Tran', 'ivy.tran@operationpizzeria.com', '803-555-1030', 'Shift Supervisor', '2024-02-05', 19.25, 'active');

INSERT INTO employee_credentials (employee_id, password_hash, hash_algorithm, failed_login_attempts, locked_until, password_updated_at)
SELECT employee_id, '$2b$12$QH3PZZk5ct3ndXGcQCmB3.jm9A1AIs9LdD.di2HtBwq.te5.u8UaO', 'bcrypt', 0, NULL, CURRENT_TIMESTAMP
FROM employees
WHERE email = 'maya.lopez@operationpizzeria.com'
UNION ALL
SELECT employee_id, '$2b$12$L6veMYXllTtRPXPw46LlYOa6FwWkk3.Xdfrk147khksLXDcu3qW1y', 'bcrypt', 0, NULL, CURRENT_TIMESTAMP
FROM employees
WHERE email = 'chris.bennett@operationpizzeria.com'
UNION ALL
SELECT employee_id, '$2b$12$RtDnQP2EmvzXxQ5sMMrHXO3TvHSVUKp0UczcUmFyGhLmLzK0yjVSK', 'bcrypt', 0, NULL, CURRENT_TIMESTAMP
FROM employees
WHERE email = 'ivy.tran@operationpizzeria.com';

INSERT INTO menu_categories (slug, category_name, sort_order, is_active)
VALUES
  ('specials', 'Specials', 1, 1),
  ('pizzas', 'Pizzas', 2, 1),
  ('wings', 'Wings', 3, 1),
  ('salads', 'Salads', 4, 1),
  ('desserts', 'Desserts', 5, 1),
  ('beverages', 'Beverages', 6, 1);

INSERT INTO menu_items (category_id, item_name, description, photo_path, base_price, is_special, special_price, is_active)
SELECT category_id, 'Daily Lunch Special', 'Two slices of pizza and a beverage for a special price, available Monday through Friday from 11am to 2pm.', 'twoPizzaDrink.jpg', 9.99, 1, 9.99, 1
FROM menu_categories
WHERE slug = 'specials'
UNION ALL
SELECT category_id, 'Combo Deal', 'Pizza, wings, and a beverage combo at a special price.', 'combo.jpg', 24.99, 1, 24.99, 1
FROM menu_categories
WHERE slug = 'specials';

INSERT INTO menu_items (category_id, item_name, description, photo_path, base_price, is_special, special_price, is_active)
SELECT category_id, 'Operation Supreme', 'Pepperoni, sausage, Canadian bacon, black olives, bell peppers, mushrooms, onions, and mozzarella.', 'supreme.jpg', 16.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'pizzas'
UNION ALL
SELECT category_id, 'Margherita Classic', 'Fresh basil, tomato sauce, and mozzarella on hand-tossed dough.', 'margherita.jpg', 14.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'pizzas'
UNION ALL
SELECT category_id, 'Caprese Delight', 'Basil Pesto sauce, roasted tomatoes, fresh mozzarella, and drizzled balsamic glaze on hand-tossed dough.', 'caprese.png', 14.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'pizzas'
UNION ALL
SELECT category_id, 'Sicilian Special', 'Pepperoni, salami, Italian sausage, tomato sauce, and mozzarella on hand-tossed dough.', 'sicilian.jpg', 14.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'pizzas'
UNION ALL
SELECT category_id, 'Veggie Supreme', 'Black olives, bell peppers, mushrooms, onions, diced tomatoes, tomato sauce, and mozzarella on hand-tossed dough.', 'veggie.jpg', 14.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'pizzas'
UNION ALL
SELECT category_id, 'Vegan Veggie', 'Black olives, bell peppers, mushrooms, onions, diced tomatoes, tomato sauce, and vegan cheese on cauliflower crust.', 'ewwww.jpg', 14.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'pizzas';

INSERT INTO menu_items (category_id, item_name, description, photo_path, base_price, is_special, special_price, is_active)
SELECT category_id, 'Traditional Wings', 'Ten crispy wings tossed in your choice of sauce.  Every 5 wings comes with option to choose another sauce and dip.', 'traditional.jpg', 12.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'wings'
UNION ALL
SELECT category_id, 'Boneless Wings', 'Ten crispy boneless wings tossed in your choice of sauce.  Every 5 wings comes with option to choose another sauce and dip.', 'boneless.jpg', 13.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'wings';

INSERT INTO menu_items (category_id, item_name, description, photo_path, base_price, is_special, special_price, is_active)
SELECT category_id, 'Garden House Salad', 'Crisp romaine, cherry tomatoes, cucumbers, croutons, and parmesan with herb vinaigrette.', 'garden.jpg', 8.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'salads'
UNION ALL
SELECT category_id, 'Chicken Caesar', 'Grilled chicken, shaved parmesan, garlic croutons, and classic Caesar dressing.', 'caesar.jpg', 10.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'salads';

INSERT INTO menu_items (category_id, item_name, description, photo_path, base_price, is_special, special_price, is_active)
SELECT category_id, 'Cinnamon Bread Bites', 'Warm baked bites glazed with cinnamon sugar and vanilla icing.', 'cinnamonbread.jpg', 6.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'desserts'
UNION ALL
SELECT category_id, 'Chocolate Lava Cake', 'Rich chocolate cake with a molten center and powdered sugar finish.', 'lavacake.jpg', 7.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'desserts';

INSERT INTO menu_items (category_id, item_name, description, photo_path, base_price, is_special, special_price, is_active)
SELECT category_id, 'Sparkling Citrus Soda', '2L  bottle', 'sparklingSoda.png', 2.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'beverages'
UNION ALL
SELECT category_id, 'Sweet Tea', '1 gal jug', 'sweetTea.jpg', 2.49, 0, NULL, 1
FROM menu_categories
WHERE slug = 'beverages'
UNION ALL
SELECT category_id, 'Coke Classic', '2L  bottle', 'coke.jpg', 2.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'beverages'
UNION ALL
SELECT category_id, 'Diet Coke', '2L bottle', 'dietcoke.jpg', 2.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'beverages'
UNION ALL
SELECT category_id, 'Dr Pepper', '2L bottle', 'drpepper.jpg', 2.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'beverages'
UNION ALL
SELECT category_id, 'Big Red', '2L bottle', 'bigred.jpg', 2.99, 0, NULL, 1
FROM menu_categories
WHERE slug = 'beverages';

INSERT INTO ingredients (ingredient_name, is_active)
VALUES
  ('Tomato Sauce', 1),
  ('Basil Pesto', 1),
  ('Mozzarella Cheese', 1),
  ('Fresh Mozzarella', 1),
  ('Vegan Cheese', 1),
  ('Pepperoni', 1),
  ('Italian Sausage', 1),
  ('Canadian Bacon', 1),
  ('Salami', 1),
  ('Black Olives', 1),
  ('Bell Peppers', 1),
  ('Mushrooms', 1),
  ('Onions', 1),
  ('Diced Tomatoes', 1),
  ('Fresh Basil', 1),
  ('Balsamic Glaze', 1),
  ('Romaine Lettuce', 1),
  ('Cherry Tomatoes', 1),
  ('Cucumbers', 1),
  ('Croutons', 1),
  ('Parmesan', 1),
  ('Herb Vinaigrette', 1),
  ('Caesar Dressing', 1),
  ('Chicken', 1),
  ('Buffalo Sauce', 1),
  ('BBQ Sauce', 1),
  ('Ranch Dip', 1),
  ('Blue Cheese Dip', 1),
  ('Beverage Syrup', 1),
  ('Dessert Mix', 1);

INSERT INTO category_ingredients (category_id, ingredient_id)
SELECT c.category_id, i.ingredient_id
FROM menu_categories c
JOIN ingredients i ON i.ingredient_name IN ('Buffalo Sauce', 'Ranch Dip', 'Blue Cheese Dip', 'Beverage Syrup')
WHERE c.slug = 'specials'
UNION ALL
SELECT c.category_id, i.ingredient_id
FROM menu_categories c
JOIN ingredients i ON i.ingredient_name IN ('Tomato Sauce', 'Basil Pesto', 'Mozzarella Cheese', 'Fresh Mozzarella', 'Vegan Cheese', 'Pepperoni', 'Italian Sausage', 'Canadian Bacon', 'Salami', 'Black Olives', 'Bell Peppers', 'Mushrooms', 'Onions', 'Diced Tomatoes', 'Fresh Basil', 'Balsamic Glaze')
WHERE c.slug = 'pizzas'
UNION ALL
SELECT c.category_id, i.ingredient_id
FROM menu_categories c
JOIN ingredients i ON i.ingredient_name IN ('Chicken', 'Buffalo Sauce', 'BBQ Sauce', 'Ranch Dip', 'Blue Cheese Dip')
WHERE c.slug = 'wings'
UNION ALL
SELECT c.category_id, i.ingredient_id
FROM menu_categories c
JOIN ingredients i ON i.ingredient_name IN ('Romaine Lettuce', 'Cherry Tomatoes', 'Cucumbers', 'Croutons', 'Parmesan', 'Herb Vinaigrette', 'Caesar Dressing', 'Chicken')
WHERE c.slug = 'salads'
UNION ALL
SELECT c.category_id, i.ingredient_id
FROM menu_categories c
JOIN ingredients i ON i.ingredient_name IN ('Dessert Mix')
WHERE c.slug = 'desserts'
UNION ALL
SELECT c.category_id, i.ingredient_id
FROM menu_categories c
JOIN ingredients i ON i.ingredient_name IN ('Beverage Syrup')
WHERE c.slug = 'beverages';

INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Tomato Sauce'
WHERE m.item_name IN ('Operation Supreme', 'Margherita Classic', 'Sicilian Special', 'Veggie Supreme', 'Vegan Veggie')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Basil Pesto'
WHERE m.item_name = 'Caprese Delight'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Mozzarella Cheese'
WHERE m.item_name IN ('Operation Supreme', 'Margherita Classic', 'Sicilian Special', 'Veggie Supreme')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Fresh Mozzarella'
WHERE m.item_name = 'Caprese Delight'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Vegan Cheese'
WHERE m.item_name = 'Vegan Veggie'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Pepperoni'
WHERE m.item_name IN ('Operation Supreme', 'Sicilian Special')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Italian Sausage'
WHERE m.item_name IN ('Operation Supreme', 'Sicilian Special')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Canadian Bacon'
WHERE m.item_name = 'Operation Supreme'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Salami'
WHERE m.item_name = 'Sicilian Special'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Black Olives'
WHERE m.item_name IN ('Operation Supreme', 'Veggie Supreme', 'Vegan Veggie')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Bell Peppers'
WHERE m.item_name IN ('Operation Supreme', 'Veggie Supreme', 'Vegan Veggie')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Mushrooms'
WHERE m.item_name IN ('Operation Supreme', 'Veggie Supreme', 'Vegan Veggie')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Onions'
WHERE m.item_name IN ('Operation Supreme', 'Veggie Supreme', 'Vegan Veggie')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Diced Tomatoes'
WHERE m.item_name IN ('Caprese Delight', 'Veggie Supreme', 'Vegan Veggie')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Fresh Basil'
WHERE m.item_name = 'Margherita Classic'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Balsamic Glaze'
WHERE m.item_name = 'Caprese Delight'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Romaine Lettuce'
WHERE m.item_name IN ('Garden House Salad', 'Chicken Caesar')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Cherry Tomatoes'
WHERE m.item_name = 'Garden House Salad'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Cucumbers'
WHERE m.item_name = 'Garden House Salad'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Croutons'
WHERE m.item_name IN ('Garden House Salad', 'Chicken Caesar')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Parmesan'
WHERE m.item_name IN ('Garden House Salad', 'Chicken Caesar')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Herb Vinaigrette'
WHERE m.item_name = 'Garden House Salad'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Caesar Dressing'
WHERE m.item_name = 'Chicken Caesar'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Chicken'
WHERE m.item_name IN ('Chicken Caesar', 'Traditional Wings', 'Boneless Wings')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Buffalo Sauce'
WHERE m.item_name IN ('Traditional Wings', 'Combo Deal')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'BBQ Sauce'
WHERE m.item_name = 'Boneless Wings'
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Ranch Dip'
WHERE m.item_name IN ('Traditional Wings', 'Boneless Wings', 'Combo Deal')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Blue Cheese Dip'
WHERE m.item_name IN ('Traditional Wings', 'Boneless Wings')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Beverage Syrup'
WHERE m.item_name IN ('Daily Lunch Special', 'Sparkling Citrus Soda', 'Sweet Tea', 'Coke Classic', 'Diet Coke', 'Dr Pepper', 'Big Red')
UNION ALL
SELECT m.menu_item_id, i.ingredient_id
FROM menu_items m
JOIN ingredients i ON i.ingredient_name = 'Dessert Mix'
WHERE m.item_name IN ('Cinnamon Bread Bites', 'Chocolate Lava Cake');

INSERT INTO customers (email, first_name, last_name, phone, loyalty_points, marketing_opt_in, last_login_at)
VALUES
  ('customer@example.com', 'Jordan', 'Reed', '803-555-2001', 120, 1, CURRENT_TIMESTAMP),
  ('sam.lee@example.com', 'Sam', 'Lee', '803-555-2002', 45, 0, CURRENT_TIMESTAMP);

INSERT INTO customer_profiles (customer_id, favorite_order, dietary_preferences, preferred_contact_method, date_of_birth, notes)
SELECT customer_id, 'Pepperoni Pizza', 'No olives', 'email', '1997-08-14', 'Prefers contactless pickup'
FROM customers
WHERE email = 'customer@example.com'
UNION ALL
SELECT customer_id, 'Garden Veggie Pizza', 'Vegetarian', 'sms', '1994-03-22', 'Allergy: peanuts in desserts'
FROM customers
WHERE email = 'sam.lee@example.com';

INSERT INTO customer_credentials (customer_id, password_hash, hash_algorithm, failed_login_attempts, locked_until, password_updated_at)
SELECT customer_id, '$2b$12$dHV3VodfTPpSLf7dn1USN.XGrBTBmjPoZ3UgJzApmHwPZQZVTN5OK', 'bcrypt', 0, NULL, CURRENT_TIMESTAMP
FROM customers
WHERE email = 'customer@example.com'
UNION ALL
SELECT customer_id, '$2b$12$q96dqrPMQRt5CJg8QpiTw.9by2RW8wH1wcad0UOntDERLcHSF5V8K', 'bcrypt', 0, NULL, CURRENT_TIMESTAMP
FROM customers
WHERE email = 'sam.lee@example.com';

INSERT INTO customer_addresses (customer_id, label, street_1, street_2, city, state, postal_code, is_default)
SELECT customer_id, 'Home', '1408 Pepper Street', NULL, 'Columbia', 'SC', '29201', 1
FROM customers
WHERE email = 'customer@example.com'
UNION ALL
SELECT customer_id, 'Apartment', '55 Blossom Ave', 'Unit 3B', 'Columbia', 'SC', '29205', 1
FROM customers
WHERE email = 'sam.lee@example.com';

INSERT INTO customer_orders (
  order_number,
  customer_id,
  delivery_address_id,
  order_type,
  status,
  subtotal_amount,
  tax_amount,
  delivery_fee,
  discount_amount,
  total_amount,
  placed_at,
  fulfilled_at,
  notes
)
SELECT 'OP-20260521-1001', c.customer_id, NULL, 'pickup', 'completed', 19.98, 1.54, 0.00, 0.00, 21.52, '2026-05-20 12:15:00', '2026-05-20 12:48:00', 'Lunch pickup order'
FROM customers c
WHERE c.email = 'customer@example.com'
UNION ALL
SELECT 'OP-20260521-1002', c.customer_id, a.address_id, 'delivery', 'preparing', 22.47, 1.74, 3.00, 2.00, 25.21, '2026-05-21 17:10:00', NULL, 'Apply promo code WELCOME2'
FROM customers c
JOIN customer_addresses a ON a.customer_id = c.customer_id AND a.is_default = 1
WHERE c.email = 'sam.lee@example.com'
UNION ALL
SELECT 'OP-20260521-1003', c.customer_id, a.address_id, 'delivery', 'completed', 21.48, 1.66, 3.00, 0.00, 26.14, '2026-05-19 18:05:00', '2026-05-19 18:52:00', 'Leave at front door'
FROM customers c
JOIN customer_addresses a ON a.customer_id = c.customer_id AND a.is_default = 1
WHERE c.email = 'customer@example.com';

INSERT INTO customer_order_items (order_id, menu_item_id, item_name_snapshot, unit_price, quantity, line_total)
SELECT o.order_id, m.menu_item_id, 'Operation Supreme', 16.99, 1, 16.99
FROM customer_orders o
JOIN menu_items m ON m.item_name = 'Operation Supreme'
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, m.menu_item_id, 'Sparkling Citrus Soda', 2.99, 1, 2.99
FROM customer_orders o
JOIN menu_items m ON m.item_name = 'Sparkling Citrus Soda'
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, m.menu_item_id, 'Daily Lunch Special', 9.99, 2, 19.98
FROM customer_orders o
JOIN menu_items m ON m.item_name = 'Daily Lunch Special'
WHERE o.order_number = 'OP-20260521-1002'
UNION ALL
SELECT o.order_id, m.menu_item_id, 'Sweet Tea', 2.49, 1, 2.49
FROM customer_orders o
JOIN menu_items m ON m.item_name = 'Sweet Tea'
WHERE o.order_number = 'OP-20260521-1002'
UNION ALL
SELECT o.order_id, m.menu_item_id, 'Vegan Veggie', 14.49, 1, 14.49
FROM customer_orders o
JOIN menu_items m ON m.item_name = 'Vegan Veggie'
WHERE o.order_number = 'OP-20260521-1003'
UNION ALL
SELECT o.order_id, m.menu_item_id, 'Cinnamon Bread Bites', 6.99, 1, 6.99
FROM customer_orders o
JOIN menu_items m ON m.item_name = 'Cinnamon Bread Bites'
WHERE o.order_number = 'OP-20260521-1003';

INSERT INTO customer_order_status_history (order_id, status, changed_by_employee_id, note, changed_at)
SELECT o.order_id, 'placed', NULL, 'Order submitted by customer', '2026-05-20 12:15:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, 'confirmed', 1, 'Order confirmed by store manager', '2026-05-20 12:17:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, 'preparing', 2, 'Kitchen started prep', '2026-05-20 12:21:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, 'ready', 2, 'Order ready at pickup counter', '2026-05-20 12:43:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, 'completed', 1, 'Customer picked up order', '2026-05-20 12:48:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1001'
UNION ALL
SELECT o.order_id, 'placed', NULL, 'Order submitted by customer', '2026-05-21 17:10:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1002'
UNION ALL
SELECT o.order_id, 'confirmed', 3, 'Order accepted for delivery', '2026-05-21 17:12:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1002'
UNION ALL
SELECT o.order_id, 'preparing', 2, 'Pizza station started order', '2026-05-21 17:15:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1002'
UNION ALL
SELECT o.order_id, 'placed', NULL, 'Order submitted by customer', '2026-05-19 18:05:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1003'
UNION ALL
SELECT o.order_id, 'confirmed', 1, 'Order accepted for delivery', '2026-05-19 18:07:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1003'
UNION ALL
SELECT o.order_id, 'preparing', 2, 'Kitchen started prep', '2026-05-19 18:11:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1003'
UNION ALL
SELECT o.order_id, 'out_for_delivery', 3, 'Driver left store', '2026-05-19 18:34:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1003'
UNION ALL
SELECT o.order_id, 'completed', 3, 'Order delivered successfully', '2026-05-19 18:52:00'
FROM customer_orders o
WHERE o.order_number = 'OP-20260521-1003';
