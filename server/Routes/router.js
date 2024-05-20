const express = require("express");
const router = new express.Router();
const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
  user: "avnadmin",
  port: 22381,
  host: "cmsservice-jayarora312002-b407.l.aivencloud.com",
  password: "AVNS_a5rNnk6rA5y8VrLctgp",
  database: "defaultdb"
});
// Helper function to create a new table
const createTable = (entityName, attributes) => {
  let query = `CREATE TABLE IF NOT EXISTS \`${entityName}\` (id INT AUTO_INCREMENT PRIMARY KEY, `;

  for (const attr of attributes) {
    const { name, type } = attr;
    query += `${name} ${getDataType(type)}, `;
  }

  query = query.slice(0, -2); // Remove trailing comma and space
  query += ')';

  return query;
};


// Helper function to map attribute types to SQL data types
const getDataType = (type) => {
  switch (type) {
    case 'string':
      return 'VARCHAR(255)';
    case 'number':
      return 'INT';
    case 'date':
      return 'DATE';
    case 'image':
      return 'VARCHAR(255)'; // Storing image path as a string
    default:
      return 'TEXT';
  }
};

// Helper function to get entity attributes from the database
const getEntityAttributes = async (entityName) => {
  const query = `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'defaultdb' AND TABLE_NAME = '${entityName}'`;
  try {
    const [rows] = await pool.query(query);
    const attributes = rows.map(row => ({
      name: row.COLUMN_NAME,
      type: row.DATA_TYPE.toLowerCase() === 'varchar' ? 'text' : row.DATA_TYPE.toLowerCase() // Ensure consistent casing and HTML input type mapping
    }));
    return attributes;
  } catch (err) {
    console.error('Error fetching attributes for entity:', err);
    throw new Error(`Error fetching attributes for entity '${entityName}'`);
  }
};

// Route to get specific entity data by ID
router.get('/entities/:entityName/data/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const query = `SELECT * FROM ${entityName} WHERE id = ?`;

  try {
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching entity data:', err);
    res.status(500).json({ error: 'Failed to fetch entity data' });
  }
});

// Route to get all data for an entity
router.get('/entities/:entityName/data', async (req, res) => {
  const { entityName } = req.params;

  try {
    const [rows] = await pool.query(`SELECT * FROM ${entityName}`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching data for entity:', err);
    res.status(500).json({ error: `Error fetching data for entity '${entityName}'` });
  }
});

// Route to get entity schema (attributes)
router.get('/entities/:entityName', async (req, res) => {
  const { entityName } = req.params;

  try {
    const attributes = await getEntityAttributes(entityName);
    console.log('Attributes:', attributes);
    res.json(attributes);
  } catch (err) {
    console.error('Error fetching attributes for entity:', err);
    res.status(500).json({ error: `Error fetching attributes for entity '${entityName}'` });
  }
});

// Route to get all entities (table names)
router.get('/entities', async (req, res) => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(row => Object.values(row)[0]);
    res.json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching entities' });
  }
});

// Route to add data to an entity
router.post('/entities/:entityName/add-data', async (req, res) => {
  const { entityName } = req.params;
  const data = req.body;

  const columns = Object.keys(data).join(', ');
  const values = Object.values(data).map(value => typeof value === 'string' ? `'${value}'` : value).join(', ');

  const query = `INSERT INTO ${entityName} (${columns}) VALUES (${values})`;

  try {
    await pool.query(query);
    res.json({ message: 'Data added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding data' });
  }
});

// Route to create a new entity
router.post('/entities', async (req, res) => {
  const { entityName, attributes } = req.body;
  const query = createTable(entityName, attributes);

  try {
    await pool.query(query);
    res.json({ message: `Entity '${entityName}' created successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating entity' });
  }
});

// Route to delete an entity
router.delete('/entities/:entityName', async (req, res) => {
  const { entityName } = req.params;
  const query = `DROP TABLE IF EXISTS ${entityName}`;

  try {
    await pool.query(query);
    res.json({ message: `Entity '${entityName}' deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting entity' });
  }
});

// Route to delete an attribute from an entity
router.delete('/entities/:entityName/attributes/:attributeName', async (req, res) => {
  const { entityName, attributeName } = req.params;
  const query = `ALTER TABLE ${entityName} DROP COLUMN ${attributeName}`;

  try {
    await pool.query(query);
    res.json({ message: `Attribute '${attributeName}' deleted successfully from entity '${entityName}'` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting attribute' });
  }
});

// Route to delete data from an entity by ID
router.delete('/entities/:entityName/data/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const query = `DELETE FROM ${entityName} WHERE id = ?`;

  try {
    const [result] = await pool.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Error deleting data' });
  }
});

// Route to update data for an entity by ID
router.put('/entities/:entityName/data/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const data = req.body;

  // Ensure the data object only contains the expected fields
  if (data.hasOwnProperty('data')) {
    delete data.data;
  }

  // Create the SQL update string
  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data).map(value => typeof value === 'string' ? `'${value}'` : value);
  values.push(parseInt(id, 10));

  const query = `UPDATE ${entityName} SET ${updates} WHERE id = ?`;

  try {
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json({ message: 'Data updated successfully' });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Error updating data' });
  }
});

module.exports = router;
