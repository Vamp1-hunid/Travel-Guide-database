require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

app.use(express.json());

// Serve frontend files from backend/public
app.use(express.static(path.join(__dirname, 'public')));

const TABLE = 'destinations';
const RESOURCE = 'destinations';

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return Boolean(value);
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function optionalNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return toNumber(value, fallback);
}

const allowedFields = [
  'destination',
  'country',
  'region',
  'continent',
  'description',
  'best_season',
  'average_budget_usd',
  'visa_required',
  'safety_rating',
  'top_attraction',
  'language',
  'currency',
  'status'
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  sendSuccess(res, {
    message: 'Travel Destination CRUD API is running',
    resource: RESOURCE,
    table: TABLE
  });
});

// GET all destinations
app.get(`/api/${RESOURCE}`, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${TABLE} ORDER BY id DESC`
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// GET one destination by ID
app.get(`/api/${RESOURCE}/:id`, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid destination ID');
    }

    const result = await pool.query(
      `SELECT * FROM ${TABLE} WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Destination not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// POST create destination
app.post(`/api/${RESOURCE}`, async (req, res) => {
  try {
    const {
      destination,
      country,
      region,
      continent,
      description,
      best_season,
      average_budget_usd,
      visa_required,
      safety_rating,
      top_attraction,
      language,
      currency,
      status
    } = req.body;

    if (!destination || !country) {
      return sendError(res, 'destination and country are required');
    }

    const values = [
      destination,
      country,
      region || null,
      continent || null,
      description || null,
      best_season || null,
      optionalNumber(average_budget_usd, 0),
      toBoolean(visa_required),
      optionalNumber(safety_rating, 3),
      top_attraction || null,
      language || null,
      currency || null,
      status || 'active'
    ];

    const result = await pool.query(
      `INSERT INTO ${TABLE} (
        destination,
        country,
        region,
        continent,
        description,
        best_season,
        average_budget_usd,
        visa_required,
        safety_rating,
        top_attraction,
        language,
        currency,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      values
    );

    return sendSuccess(res, result.rows[0], 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// PUT update destination
app.put(`/api/${RESOURCE}/:id`, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid destination ID');
    }

    const setParts = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        setParts.push(`${field} = $${values.length + 1}`);

        let value = req.body[field];

        if (field === 'visa_required') {
          value = toBoolean(value);
        } else if (field === 'average_budget_usd') {
          value = optionalNumber(value, 0);
        } else if (field === 'safety_rating') {
          value = optionalNumber(value, 3);
        }

        values.push(value);
      }
    }

    if (setParts.length === 0) {
      return sendError(res, 'No valid fields provided for update');
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE ${TABLE}
       SET ${setParts.join(', ')}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Destination not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// DELETE destination
app.delete(`/api/${RESOURCE}/:id`, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid destination ID');
    }

    const result = await pool.query(
      `DELETE FROM ${TABLE} WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return sendError(res, 'Destination not found', 404);
    }

    return sendSuccess(res, {
      message: 'Destination deleted successfully',
      id
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// JSON 404 handler for unknown routes
app.use((req, res) => {
  sendError(res, 'Endpoint not found', 404);
});

// JSON error handler
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return sendError(res, 'Invalid JSON body', 400);
  }

  console.error(err);
  return sendError(res, err.message || 'Internal server error', 500);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
