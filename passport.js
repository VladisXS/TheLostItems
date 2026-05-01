const pool = require('../../config/database');

async function ensureMultiImageColumns() {
  await pool.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS main_image_url TEXT;');
  await pool.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS secondary_image_urls TEXT;');
}

// Get all items
const getItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY date_found DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

// Create new item (admin only)
const createItem = async (req, res) => {
  try {
    console.log('📝 Creating item... Body:', JSON.stringify(req.body).substring(0, 100));
    await ensureMultiImageColumns();
    const { name, description, date_found, image_url, main_image_url, secondary_image_urls } = req.body;

    if (!name || !description || !date_found) {
      console.error('❌ Missing required fields:', { name: !!name, description: !!description, date_found: !!date_found });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mainImage = main_image_url ?? image_url ?? null;
    const secondaryImages = Array.isArray(secondary_image_urls) ? secondary_image_urls.slice(0, 3) : [];

    console.log('✅ Fields valid, inserting into database...');
    const result = await pool.query(
      'INSERT INTO items (name, description, date_found, image_url, main_image_url, secondary_image_urls, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [name, description, date_found, mainImage, mainImage, JSON.stringify(secondaryImages)]
    );

    console.log('✅ Item created successfully:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating item:', error.message);
    res.status(500).json({ error: 'Failed to create item', details: error.message });
  }
};

// Update item (admin only)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    await ensureMultiImageColumns();
    const { name, description, date_found, image_url, main_image_url, secondary_image_urls } = req.body;
    const mainImage = main_image_url ?? image_url ?? null;
    const secondaryImages = Array.isArray(secondary_image_urls) ? secondary_image_urls.slice(0, 3) : [];

    const result = await pool.query(
      'UPDATE items SET name = $1, description = $2, date_found = $3, image_url = $4, main_image_url = $5, secondary_image_urls = $6 WHERE id = $7 RETURNING *',
      [name, description, date_found, mainImage, mainImage, JSON.stringify(secondaryImages), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Delete item (admin only)
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
