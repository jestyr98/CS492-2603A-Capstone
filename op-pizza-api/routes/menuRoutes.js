const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

function registerMenuRoutes(app, deps) {
  const {
    APP_ASSETS_DIR,
    requireSecureTransport,
    requireSession,
    requireAdminMenuAccess,
    ensureMenuDatabase,
    getMenuSections,
    dbAll,
    dbGet,
    dbRun,
    adminMenuItemSchema,
  } = deps;

  if (!fs.existsSync(APP_ASSETS_DIR)) {
    fs.mkdirSync(APP_ASSETS_DIR, { recursive: true });
  }

  const menuImageUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, APP_ASSETS_DIR),
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname || '').toLowerCase();
        const safeExtension = ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(extension) ? extension : '.jpg';
        const uniquePart = crypto.randomBytes(8).toString('hex');
        cb(null, `menu-${Date.now()}-${uniquePart}${safeExtension}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        cb(new Error('Only image uploads are allowed.'));
        return;
      }
      cb(null, true);
    },
  });

  app.get('/api/menu', async (req, res) => {
    let db;
    try {
      db = await ensureMenuDatabase();
      const sections = await getMenuSections(db);
      res.json({ sections });
    } catch (err) {
      res.status(500).json({
        error: 'Unable to load menu from database',
        details: err.message,
      });
    } finally {
      if (db) {
        db.close();
      }
    }
  });

  app.get('/api/assets/:fileName', (req, res) => {
    const fileName = path.basename(req.params.fileName || '');
    if (!fileName || fileName !== req.params.fileName) {
      return res.status(400).json({ error: 'Invalid file name.' });
    }

    const fullPath = path.join(APP_ASSETS_DIR, fileName);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    res.sendFile(fullPath);
  });

  app.post('/api/admin/menu-images', requireSecureTransport, requireSession, requireAdminMenuAccess, (req, res) => {
    menuImageUpload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Unable to upload image.' });
      }

      if (!req.file || !req.file.filename) {
        return res.status(400).json({ error: 'Image file is required.' });
      }

      res.status(201).json({ photoPath: req.file.filename });
    });
  });

  app.get('/api/admin/menu/options', requireSession, requireAdminMenuAccess, async (req, res) => {
    let db;
    try {
      db = await ensureMenuDatabase();
      const [categories, ingredientItems, categoryIngredients, menuItems] = await Promise.all([
        dbAll(
          db,
          `
            SELECT category_id AS id, slug, category_name AS title
            FROM menu_categories
            WHERE is_active = 1
            ORDER BY sort_order ASC;
          `
        ),
        dbAll(
          db,
          `
            SELECT ingredient_id AS id, ingredient_name AS name
            FROM ingredients
            WHERE is_active = 1
            ORDER BY ingredient_name ASC;
          `
        ),
        dbAll(
          db,
          `
            SELECT category_id AS categoryId, ingredient_id AS ingredientId
            FROM category_ingredients;
          `
        ),
        dbAll(
          db,
          `
            SELECT m.menu_item_id AS id, m.item_name AS name, c.category_name AS categoryName
            FROM menu_items m
            JOIN menu_categories c ON c.category_id = m.category_id
            WHERE m.is_active = 1
            ORDER BY c.sort_order ASC, m.item_name ASC;
          `
        ),
      ]);

      res.json({ categories, ingredientItems, categoryIngredients, menuItems });
    } catch {
      res.status(500).json({ error: 'Unable to load admin options right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });

  app.post('/api/admin/menu-items', requireSecureTransport, requireSession, requireAdminMenuAccess, async (req, res) => {
    const parsed = adminMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid menu item payload.' });
    }

    let db;
    try {
      db = await ensureMenuDatabase();
      const data = parsed.data;

      const category = await dbGet(
        db,
        'SELECT category_id FROM menu_categories WHERE category_id = ? AND is_active = 1 LIMIT 1;',
        [data.categoryId]
      );
      if (!category) {
        return res.status(400).json({ error: 'Selected category does not exist.' });
      }

      const ingredientPlaceholders = data.ingredientIds.map(() => '?').join(',');
      const ingredientCountRow = await dbGet(
        db,
        `
          SELECT COUNT(*) AS total
          FROM ingredients
          WHERE is_active = 1
            AND ingredient_id IN (${ingredientPlaceholders});
        `,
        data.ingredientIds
      );

      if (!ingredientCountRow || Number(ingredientCountRow.total) !== data.ingredientIds.length) {
        return res.status(400).json({ error: 'Selected ingredients must exist in active ingredient records.' });
      }

      const allowedCountRow = await dbGet(
        db,
        `
          SELECT COUNT(*) AS total
          FROM category_ingredients
          WHERE category_id = ?
            AND ingredient_id IN (${ingredientPlaceholders});
        `,
        [data.categoryId, ...data.ingredientIds]
      );

      if (!allowedCountRow || Number(allowedCountRow.total) !== data.ingredientIds.length) {
        return res.status(400).json({ error: 'One or more selected ingredients are not valid for the chosen menu type.' });
      }

      await dbRun(db, 'BEGIN TRANSACTION;');
      const createdItem = await dbRun(
        db,
        `
          INSERT INTO menu_items (
            category_id,
            item_name,
            description,
            photo_path,
            base_price,
            is_special,
            special_price,
            is_active,
            last_updated_by_employee_id
          )
          VALUES (?, ?, ?, ?, ?, 0, NULL, 1, ?);
        `,
        [
          data.categoryId,
          data.itemName.trim(),
          data.description.trim(),
          data.photoPath.trim(),
          Number(data.basePrice),
          req.session.user.accountType === 'employee' ? req.session.user.accountId : null,
        ]
      );

      for (const ingredientId of data.ingredientIds) {
        await dbRun(
          db,
          `
            INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
            VALUES (?, ?);
          `,
          [createdItem.lastID, ingredientId]
        );
      }

      await dbRun(db, 'COMMIT;');
      res.status(201).json({ ok: true, menuItemId: createdItem.lastID });
    } catch (err) {
      if (db) {
        try {
          await dbRun(db, 'ROLLBACK;');
        } catch {
          // Ignore rollback errors during error handling.
        }
      }

      if (String(err.message || '').includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'A menu item with that name already exists in this category.' });
      }

      res.status(500).json({ error: 'Unable to create menu item right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });

  app.delete('/api/admin/menu-items/:menuItemId', requireSecureTransport, requireSession, requireAdminMenuAccess, async (req, res) => {
    const menuItemId = Number(req.params.menuItemId);
    if (!Number.isInteger(menuItemId) || menuItemId < 1) {
      return res.status(400).json({ error: 'Invalid menu item id.' });
    }

    let db;
    try {
      db = await ensureMenuDatabase();

      await dbRun(db, 'BEGIN TRANSACTION;');
      const updateResult = await dbRun(
        db,
        `
          UPDATE menu_items
          SET is_active = 0,
              last_updated_by_employee_id = ?
          WHERE menu_item_id = ?
            AND is_active = 1;
        `,
        [req.session.user.accountType === 'employee' ? req.session.user.accountId : null, menuItemId]
      );

      if (!updateResult || updateResult.changes === 0) {
        await dbRun(db, 'ROLLBACK;');
        return res.status(404).json({ error: 'Menu item not found or already inactive.' });
      }

      await dbRun(db, 'DELETE FROM menu_item_ingredients WHERE menu_item_id = ?;', [menuItemId]);
      await dbRun(db, 'COMMIT;');
      res.json({ ok: true });
    } catch {
      if (db) {
        try {
          await dbRun(db, 'ROLLBACK;');
        } catch {
          // Ignore rollback errors during error handling.
        }
      }
      res.status(500).json({ error: 'Unable to remove menu item right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });
}

module.exports = registerMenuRoutes;
