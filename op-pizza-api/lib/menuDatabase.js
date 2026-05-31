const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const MENU_ITEM_PHOTOS = {
  'Daily Lunch Special': 'twoPizzaDrink.jpg',
  'Combo Deal': 'combo.jpg',
  'Operation Supreme': 'supreme.jpg',
  'Margherita Classic': 'margherita.jpg',
  'Caprese Delight': 'caprese.png',
  'Sicilian Special': 'sicilian.jpg',
  'Veggie Supreme': 'veggie.jpg',
  'Vegan Veggie': 'ewwww.jpg',
  'Traditional Wings': 'traditional.jpg',
  'Boneless Wings': 'boneless.jpg',
  'Garden House Salad': 'garden.jpg',
  'Chicken Caesar': 'caesar.jpg',
  'Cinnamon Bread Bites': 'cinnamonbread.jpg',
  'Chocolate Lava Cake': 'lavacake.jpg',
  'Sparkling Citrus Soda': 'sparklingSoda.png',
  'Sweet Tea': 'sweetTea.jpg',
  'Coke Classic': 'coke.jpg',
  'Diet Coke': 'dietcoke.jpg',
  'Dr Pepper': 'drpepper.jpg',
  'Big Red': 'bigred.jpg',
};

function createMenuDatabase({ APP_DB_PATH, APP_DB_SCHEMA_PATH, APP_DB_SEED_PATH, APP_DEV_SECRETS_PATH, BCRYPT_SALT_ROUNDS }) {
  function openMenuDb() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(APP_DB_PATH, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(db);
      });
    });
  }

  function dbRun(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function runCallback(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  function dbGet(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  function dbAll(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
  }

  function loadDevCredentialsFromSecrets() {
    if (!fs.existsSync(APP_DEV_SECRETS_PATH)) {
      return [];
    }

    const fileContents = fs.readFileSync(APP_DEV_SECRETS_PATH, 'utf8');
    return fileContents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && line.includes(','))
      .map((line) => {
        const [emailPart, ...passwordParts] = line.split(',');
        const email = emailPart.trim().toLowerCase();
        const password = passwordParts.join(',').trim();
        return { email, password };
      })
      .filter((entry) => entry.email && entry.password);
  }

  async function syncDevCredentialHashes(db) {
    const credentials = loadDevCredentialsFromSecrets();

    for (const { email, password } of credentials) {
      const customerCredential = await dbGet(
        db,
        `
          SELECT cc.customer_id, cc.password_hash
          FROM customers c
          JOIN customer_credentials cc ON cc.customer_id = c.customer_id
          WHERE LOWER(c.email) = LOWER(?)
          LIMIT 1;
        `,
        [email]
      );

      if (customerCredential) {
        const isMatch = await bcrypt.compare(password, customerCredential.password_hash);
        if (!isMatch) {
          const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
          await dbRun(
            db,
            `
              UPDATE customer_credentials
              SET password_hash = ?, hash_algorithm = 'bcrypt', password_updated_at = CURRENT_TIMESTAMP
              WHERE customer_id = ?;
            `,
            [passwordHash, customerCredential.customer_id]
          );
        }
        continue;
      }

      const employeeCredential = await dbGet(
        db,
        `
          SELECT ec.employee_id, ec.password_hash
          FROM employees e
          JOIN employee_credentials ec ON ec.employee_id = e.employee_id
          WHERE LOWER(e.email) = LOWER(?)
          LIMIT 1;
        `,
        [email]
      );

      if (employeeCredential) {
        const isMatch = await bcrypt.compare(password, employeeCredential.password_hash);
        if (!isMatch) {
          const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
          await dbRun(
            db,
            `
              UPDATE employee_credentials
              SET password_hash = ?, hash_algorithm = 'bcrypt', password_updated_at = CURRENT_TIMESTAMP
              WHERE employee_id = ?;
            `,
            [passwordHash, employeeCredential.employee_id]
          );
        }
      }
    }
  }

  async function getAccountByEmail(db, email) {
    const customer = await dbGet(
      db,
      `
        SELECT
          c.customer_id AS account_id,
          c.email,
          c.first_name,
          c.last_name,
          c.phone,
          cc.password_hash,
          'customer' AS account_type
        FROM customers c
        JOIN customer_credentials cc ON cc.customer_id = c.customer_id
        WHERE LOWER(c.email) = LOWER(?)
        LIMIT 1;
      `,
      [email]
    );

    if (customer) {
      return customer;
    }

    return dbGet(
      db,
      `
        SELECT
          e.employee_id AS account_id,
          e.email,
          e.first_name,
          e.last_name,
          e.phone,
          e.job_title,
          ec.password_hash,
          'employee' AS account_type
        FROM employees e
        JOIN employee_credentials ec ON ec.employee_id = e.employee_id
        WHERE LOWER(e.email) = LOWER(?)
        LIMIT 1;
      `,
      [email]
    );
  }

  async function ensureMenuPhotoColumn(db) {
    const columns = await dbAll(db, 'PRAGMA table_info(menu_items);');
    const hasPhotoPathColumn = columns.some((column) => column.name === 'photo_path');

    if (!hasPhotoPathColumn) {
      await dbRun(db, 'ALTER TABLE menu_items ADD COLUMN photo_path TEXT;');
    }
  }

  async function ensureIngredientTables(db) {
    await dbRun(
      db,
      `
        CREATE TABLE IF NOT EXISTS ingredients (
          ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
          ingredient_name TEXT NOT NULL UNIQUE,
          is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `
    );

    await dbRun(
      db,
      `
        CREATE TABLE IF NOT EXISTS category_ingredients (
          category_id INTEGER NOT NULL,
          ingredient_id INTEGER NOT NULL,
          PRIMARY KEY (category_id, ingredient_id),
          FOREIGN KEY (category_id) REFERENCES menu_categories(category_id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
        );
      `
    );

    await dbRun(
      db,
      `
        CREATE TABLE IF NOT EXISTS menu_item_ingredients (
          menu_item_id INTEGER NOT NULL,
          ingredient_id INTEGER NOT NULL,
          PRIMARY KEY (menu_item_id, ingredient_id),
          FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT
        );
      `
    );

    await dbRun(
      db,
      `
        CREATE TRIGGER IF NOT EXISTS trg_ingredients_updated_at
        AFTER UPDATE ON ingredients
        FOR EACH ROW
        BEGIN
          UPDATE ingredients SET updated_at = CURRENT_TIMESTAMP WHERE ingredient_id = OLD.ingredient_id;
        END;
      `
    );
  }

  async function seedIngredients(db) {
    const ingredientNames = [
      'Tomato Sauce',
      'Basil Pesto',
      'Mozzarella Cheese',
      'Fresh Mozzarella',
      'Vegan Cheese',
      'Pepperoni',
      'Italian Sausage',
      'Canadian Bacon',
      'Salami',
      'Black Olives',
      'Bell Peppers',
      'Mushrooms',
      'Onions',
      'Diced Tomatoes',
      'Fresh Basil',
      'Balsamic Glaze',
      'Romaine Lettuce',
      'Cherry Tomatoes',
      'Cucumbers',
      'Croutons',
      'Parmesan',
      'Herb Vinaigrette',
      'Caesar Dressing',
      'Chicken',
      'Buffalo Sauce',
      'BBQ Sauce',
      'Ranch Dip',
      'Blue Cheese Dip',
      'Beverage Syrup',
      'Dessert Mix',
    ];

    for (const ingredientName of ingredientNames) {
      await dbRun(
        db,
        `
          INSERT INTO ingredients (ingredient_name, is_active)
          VALUES (?, 1)
          ON CONFLICT(ingredient_name) DO UPDATE SET
            is_active = 1;
        `,
        [ingredientName]
      );
    }
  }

  async function seedCategoryIngredients(db) {
    const categoryIngredientLinks = [
      ['specials', ['Buffalo Sauce', 'Ranch Dip', 'Blue Cheese Dip', 'Beverage Syrup']],
      ['pizzas', ['Tomato Sauce', 'Basil Pesto', 'Mozzarella Cheese', 'Fresh Mozzarella', 'Vegan Cheese', 'Pepperoni', 'Italian Sausage', 'Canadian Bacon', 'Salami', 'Black Olives', 'Bell Peppers', 'Mushrooms', 'Onions', 'Diced Tomatoes', 'Fresh Basil', 'Balsamic Glaze']],
      ['wings', ['Chicken', 'Buffalo Sauce', 'BBQ Sauce', 'Ranch Dip', 'Blue Cheese Dip']],
      ['salads', ['Romaine Lettuce', 'Cherry Tomatoes', 'Cucumbers', 'Croutons', 'Parmesan', 'Herb Vinaigrette', 'Caesar Dressing', 'Chicken']],
      ['desserts', ['Dessert Mix']],
      ['beverages', ['Beverage Syrup']],
    ];

    for (const [categorySlug, ingredientNames] of categoryIngredientLinks) {
      const category = await dbGet(db, 'SELECT category_id FROM menu_categories WHERE slug = ? LIMIT 1;', [categorySlug]);
      if (!category) {
        continue;
      }

      for (const ingredientName of ingredientNames) {
        const ingredient = await dbGet(db, 'SELECT ingredient_id FROM ingredients WHERE ingredient_name = ? LIMIT 1;', [ingredientName]);
        if (!ingredient) {
          continue;
        }

        await dbRun(
          db,
          `
            INSERT OR IGNORE INTO category_ingredients (category_id, ingredient_id)
            VALUES (?, ?);
          `,
          [category.category_id, ingredient.ingredient_id]
        );
      }
    }
  }

  async function seedMenuItemIngredients(db) {
    const defaultLinks = [
      ['Daily Lunch Special', ['Beverage Syrup']],
      ['Combo Deal', ['Buffalo Sauce', 'Ranch Dip']],
      ['Operation Supreme', ['Tomato Sauce', 'Mozzarella Cheese', 'Pepperoni', 'Italian Sausage', 'Canadian Bacon', 'Black Olives', 'Bell Peppers', 'Mushrooms', 'Onions']],
      ['Margherita Classic', ['Tomato Sauce', 'Mozzarella Cheese', 'Fresh Basil']],
      ['Caprese Delight', ['Basil Pesto', 'Fresh Mozzarella', 'Diced Tomatoes', 'Balsamic Glaze']],
      ['Sicilian Special', ['Tomato Sauce', 'Mozzarella Cheese', 'Pepperoni', 'Salami', 'Italian Sausage']],
      ['Veggie Supreme', ['Tomato Sauce', 'Mozzarella Cheese', 'Black Olives', 'Bell Peppers', 'Mushrooms', 'Onions', 'Diced Tomatoes']],
      ['Vegan Veggie', ['Tomato Sauce', 'Vegan Cheese', 'Black Olives', 'Bell Peppers', 'Mushrooms', 'Onions', 'Diced Tomatoes']],
      ['Traditional Wings', ['Chicken', 'Buffalo Sauce', 'Ranch Dip', 'Blue Cheese Dip']],
      ['Boneless Wings', ['Chicken', 'BBQ Sauce', 'Ranch Dip', 'Blue Cheese Dip']],
      ['Garden House Salad', ['Romaine Lettuce', 'Cherry Tomatoes', 'Cucumbers', 'Croutons', 'Parmesan', 'Herb Vinaigrette']],
      ['Chicken Caesar', ['Romaine Lettuce', 'Chicken', 'Parmesan', 'Croutons', 'Caesar Dressing']],
      ['Cinnamon Bread Bites', ['Dessert Mix']],
      ['Chocolate Lava Cake', ['Dessert Mix']],
      ['Sparkling Citrus Soda', ['Beverage Syrup']],
      ['Sweet Tea', ['Beverage Syrup']],
      ['Coke Classic', ['Beverage Syrup']],
      ['Diet Coke', ['Beverage Syrup']],
      ['Dr Pepper', ['Beverage Syrup']],
      ['Big Red', ['Beverage Syrup']],
    ];

    for (const [menuItemName, ingredientNames] of defaultLinks) {
      const menuItem = await dbGet(
        db,
        'SELECT menu_item_id FROM menu_items WHERE item_name = ? AND is_active = 1 LIMIT 1;',
        [menuItemName]
      );

      if (!menuItem) {
        continue;
      }

      for (const ingredientName of ingredientNames) {
        const ingredient = await dbGet(
          db,
          'SELECT ingredient_id FROM ingredients WHERE ingredient_name = ? LIMIT 1;',
          [ingredientName]
        );

        if (!ingredient) {
          continue;
        }

        await dbRun(
          db,
          `
            INSERT OR IGNORE INTO menu_item_ingredients (menu_item_id, ingredient_id)
            VALUES (?, ?);
          `,
          [menuItem.menu_item_id, ingredient.ingredient_id]
        );
      }
    }
  }

  async function backfillMenuPhotoPaths(db) {
    await dbRun(db, 'BEGIN TRANSACTION;');
    try {
      for (const [itemName, photoPath] of Object.entries(MENU_ITEM_PHOTOS)) {
        await dbRun(
          db,
          `
            UPDATE menu_items
            SET photo_path = ?
            WHERE item_name = ?
              AND (photo_path IS NULL OR photo_path = '');
          `,
          [photoPath, itemName]
        );
      }
      await dbRun(db, 'COMMIT;');
    } catch (err) {
      await dbRun(db, 'ROLLBACK;');
      throw err;
    }
  }

  async function ensureMenuDatabase() {
    if (!fs.existsSync(APP_DB_SCHEMA_PATH) || !fs.existsSync(APP_DB_SEED_PATH)) {
      throw new Error('Database schema/seed files not found in op-pizza/database.');
    }

    const shouldBootstrap = !fs.existsSync(APP_DB_PATH);
    const db = await openMenuDb();

    if (!shouldBootstrap) {
      await ensureMenuPhotoColumn(db);
      await ensureIngredientTables(db);
      await seedIngredients(db);
      await seedCategoryIngredients(db);
      await seedMenuItemIngredients(db);
      await backfillMenuPhotoPaths(db);
      await syncDevCredentialHashes(db);
      return db;
    }

    const schemaSql = fs.readFileSync(APP_DB_SCHEMA_PATH, 'utf8');
    const seedSql = fs.readFileSync(APP_DB_SEED_PATH, 'utf8');

    await new Promise((resolve, reject) => {
      db.exec(`${schemaSql}\n${seedSql}`, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    await ensureMenuPhotoColumn(db);
    await ensureIngredientTables(db);
    await seedIngredients(db);
    await seedCategoryIngredients(db);
    await seedMenuItemIngredients(db);
    await backfillMenuPhotoPaths(db);
    await syncDevCredentialHashes(db);

    return db;
  }

  function getMenuSections(db) {
    const menuQuery = `
      SELECT
        c.slug AS section_id,
        c.category_name AS section_title,
        c.sort_order,
        m.menu_item_id,
        m.item_name,
        m.description,
        m.photo_path,
        CASE
          WHEN m.is_special = 1 AND m.special_price IS NOT NULL THEN m.special_price
          ELSE m.base_price
        END AS display_price
      FROM menu_categories c
      LEFT JOIN menu_items m
        ON m.category_id = c.category_id
        AND m.is_active = 1
      WHERE c.is_active = 1
      ORDER BY c.sort_order ASC, m.item_name ASC;
    `;

    const itemIngredientsQuery = `
      SELECT
        mi.menu_item_id,
        i.ingredient_name
      FROM menu_item_ingredients mi
      JOIN ingredients i ON i.ingredient_id = mi.ingredient_id
      WHERE i.is_active = 1
      ORDER BY i.ingredient_name ASC;
    `;

    const categoryIngredientsQuery = `
      SELECT
        c.slug AS section_id,
        i.ingredient_name
      FROM category_ingredients ci
      JOIN menu_categories c ON c.category_id = ci.category_id
      JOIN ingredients i ON i.ingredient_id = ci.ingredient_id
      WHERE c.is_active = 1
        AND i.is_active = 1
      ORDER BY c.sort_order ASC, i.ingredient_name ASC;
    `;

    const buildOptions = ({ sectionId, itemName, itemIngredients, categoryIngredients, itemNamesBySectionId, ingredientsBySectionId }) => {
      const sauceOptions = categoryIngredients.filter((name) => /sauce|pesto/i.test(name));
      const dipOptions = categoryIngredients.filter((name) => /dip/i.test(name));
      const dressingOptions = categoryIngredients.filter((name) => /dressing|vinaigrette/i.test(name));
      const nonFlavorIngredientOptions = itemIngredients.filter(
        (name) => !/sauce|pesto|dip|dressing|vinaigrette/i.test(name)
      );

      const options = {};

      if (sectionId === 'pizzas') {
        if (nonFlavorIngredientOptions.length > 0) {
          options.removeIngredients = nonFlavorIngredientOptions;
        }

        if (sauceOptions.length > 0) {
          options.sauceOne = sauceOptions;
        }
      }

      if (sectionId === 'wings') {
        if (sauceOptions.length > 0) {
          options.wingCoatingSauces = sauceOptions;
        }

        if (dipOptions.length > 0) {
          options.wingDipSauces = dipOptions;
        }

        options.wingOrderUnit = 10;
      }

      if (sectionId === 'salads') {
        if (dressingOptions.length > 0) {
          options.dressing = dressingOptions;
        }

        if (nonFlavorIngredientOptions.length > 0) {
          options.removeIngredients = nonFlavorIngredientOptions;
        }
      }

      if (sectionId === 'specials') {
        const pizzaChoices = itemNamesBySectionId.get('pizzas') || [];
        const wingChoices = itemNamesBySectionId.get('wings') || [];
        const beverageChoices = itemNamesBySectionId.get('beverages') || [];
        const pizzaCategoryIngredients = ingredientsBySectionId.get('pizzas') || [];
        const pizzaToppings = pizzaCategoryIngredients.filter(
          (name) => !/sauce|pesto|dip|dressing|vinaigrette/i.test(name)
        );

        if (itemName === 'Daily Lunch Special') {
          if (beverageChoices.length > 0) {
            options.drink = beverageChoices;
          }

          if (pizzaToppings.length > 0) {
            options.sliceOneIngredients = pizzaToppings;
            options.sliceTwoIngredients = pizzaToppings;
            options.includedToppingsCount = 2;
            options.extraToppingPrice = 1.0;
          }
        }

        if (itemName === 'Combo Deal') {
          const comboPizzaChoices = Array.from(new Set([...pizzaChoices, 'Build Your Own Pizza']));
          const wingCategoryIngredients = ingredientsBySectionId.get('wings') || [];
          const wingCoatingSauceOptions = wingCategoryIngredients.filter((name) => /sauce|pesto/i.test(name));
          const wingDipSauceOptions = wingCategoryIngredients.filter((name) => /dip/i.test(name));
          const pizzaSauceOptions = pizzaCategoryIngredients.filter((name) => /sauce|pesto/i.test(name));

          if (comboPizzaChoices.length > 0) {
            options.pizzaChoice = comboPizzaChoices;
          }

          if (wingChoices.length > 0) {
            options.wingChoice = wingChoices;
          }

          if (beverageChoices.length > 0) {
            options.beverageChoice = beverageChoices;
          }

          if (pizzaSauceOptions.length > 0) {
            options.comboPizzaSauces = pizzaSauceOptions;
          }

          if (pizzaToppings.length > 0) {
            options.comboPizzaToppings = pizzaToppings;
          }

          options.comboPizzaSizes = ['Personal', 'Medium', 'Large'];

          if (wingCoatingSauceOptions.length > 0) {
            options.comboWingCoatingSauces = wingCoatingSauceOptions;
          }

          if (wingDipSauceOptions.length > 0) {
            options.comboWingDipSauces = wingDipSauceOptions;
          }
        }
      }

      return Object.keys(options).length > 0 ? options : undefined;
    };

    const buildYourOwnPizzaItem = (pizzaCategoryIngredients) => {
      const sizeOptions = ['Personal', 'Medium', 'Large'];
      const basePrice = {
        Personal: 9.99,
        Medium: 14.99,
        Large: 16.99,
      };

      const sauceOptions = pizzaCategoryIngredients.filter((name) => /sauce|pesto/i.test(name));
      const extraCandidates = pizzaCategoryIngredients.filter(
        (name) => !/sauce|pesto|dip|dressing|vinaigrette/i.test(name)
      );

      const options = {
        size: sizeOptions,
        addExtras: extraCandidates.map((name) => ({ name, price: 1.0 })),
      };

      if (sauceOptions.length > 0) {
        options.sauceOne = sauceOptions;
      }

      return {
        id: 'virtual-build-your-own-pizza',
        name: 'Build Your Own Pizza',
        description: 'Start with crust and sauce, then pick your size and add the toppings you want.',
        photoPath: null,
        price: formatCurrency(basePrice.Large),
        basePrice,
        options,
      };
    };

    return new Promise((resolve, reject) => {
      db.all(menuQuery, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(itemIngredientsQuery, (itemIngredientErr, itemIngredientRows) => {
          if (itemIngredientErr) {
            reject(itemIngredientErr);
            return;
          }

          db.all(categoryIngredientsQuery, (categoryIngredientErr, categoryIngredientRows) => {
            if (categoryIngredientErr) {
              reject(categoryIngredientErr);
              return;
            }

            const ingredientsByItemId = new Map();
            for (const ingredientRow of itemIngredientRows || []) {
              const ingredientList = ingredientsByItemId.get(ingredientRow.menu_item_id) || [];
              ingredientList.push(ingredientRow.ingredient_name);
              ingredientsByItemId.set(ingredientRow.menu_item_id, ingredientList);
            }

            const ingredientsBySectionId = new Map();
            for (const ingredientRow of categoryIngredientRows || []) {
              const ingredientList = ingredientsBySectionId.get(ingredientRow.section_id) || [];
              ingredientList.push(ingredientRow.ingredient_name);
              ingredientsBySectionId.set(ingredientRow.section_id, ingredientList);
            }

            const itemNamesBySectionId = new Map();
            for (const row of rows || []) {
              if (!row.menu_item_id) {
                continue;
              }

              const itemNames = itemNamesBySectionId.get(row.section_id) || [];
              itemNames.push(row.item_name);
              itemNamesBySectionId.set(row.section_id, itemNames);
            }

            const sectionsMap = new Map();
            for (const row of rows) {
              if (!sectionsMap.has(row.section_id)) {
                sectionsMap.set(row.section_id, {
                  id: row.section_id,
                  title: row.section_title,
                  sortOrder: row.sort_order,
                  items: [],
                });
              }

              if (row.menu_item_id) {
                const itemIngredients = ingredientsByItemId.get(row.menu_item_id) || [];
                const categoryIngredients = ingredientsBySectionId.get(row.section_id) || [];
                const options = buildOptions({
                  sectionId: row.section_id,
                  itemName: row.item_name,
                  itemIngredients,
                  categoryIngredients,
                  itemNamesBySectionId,
                  ingredientsBySectionId,
                });

                const itemPayload = {
                  id: row.menu_item_id,
                  name: row.item_name,
                  description: row.description,
                  photoPath: row.photo_path || null,
                  price: formatCurrency(row.display_price),
                };

                if (options) {
                  itemPayload.options = options;
                }

                sectionsMap.get(row.section_id).items.push(itemPayload);
              }
            }

            const sections = Array.from(sectionsMap.values())
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(({ sortOrder, ...section }) => section);

            const pizzasSection = sections.find((section) => section.id === 'pizzas');
            if (pizzasSection) {
              const hasBuildYourOwn = pizzasSection.items.some(
                (item) => String(item.name || '').toLowerCase() === 'build your own pizza'
              );

              if (!hasBuildYourOwn) {
                const pizzaCategoryIngredients = ingredientsBySectionId.get('pizzas') || [];
                pizzasSection.items.push(buildYourOwnPizzaItem(pizzaCategoryIngredients));
              }
            }

            resolve(sections);
          });
        });
      });
    });
  }

  return {
    dbRun,
    dbGet,
    dbAll,
    getAccountByEmail,
    ensureMenuDatabase,
    getMenuSections,
  };
}

module.exports = { createMenuDatabase };
