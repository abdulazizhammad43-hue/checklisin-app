import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/defects - Get all defects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, u.username as created_by_username 
      FROM defects d 
      LEFT JOIN users u ON d.created_by = u.id 
      ORDER BY d.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get defects error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengambil data defect' 
    });
  }
});

// GET /api/defects/:id - Get defect by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT d.*, u.username as created_by_username 
      FROM defects d 
      LEFT JOIN users u ON d.created_by = u.id 
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Defect tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get defect error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengambil data defect' 
    });
  }
});

// POST /api/defects - Create new defect
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, defect_type, lantai, as_location, before_photo, notification_time } = req.body;

    if (!name || !defect_type || !lantai || !as_location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Semua field wajib diisi' 
      });
    }

    // Calculate notification_at if notification_time is provided
    let notification_at = null;
    if (notification_time) {
      notification_at = new Date(Date.now() + notification_time * 1000);
    }

    const result = await pool.query(`
      INSERT INTO defects (name, defect_type, lantai, as_location, before_photo, notification_time, notification_at, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [name, defect_type, lantai, as_location, before_photo, notification_time, notification_at, req.user.id]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Defect berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Create defect error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal menambahkan defect' 
    });
  }
});

// PUT /api/defects/:id - Update defect
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, defect_type, lantai, as_location, status, before_photo, after_photo } = req.body;

    // Check if defect exists
    const existing = await pool.query('SELECT id FROM defects WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Defect tidak ditemukan' 
      });
    }

    const result = await pool.query(`
      UPDATE defects 
      SET name = COALESCE($1, name),
          defect_type = COALESCE($2, defect_type),
          lantai = COALESCE($3, lantai),
          as_location = COALESCE($4, as_location),
          status = COALESCE($5, status),
          before_photo = COALESCE($6, before_photo),
          after_photo = COALESCE($7, after_photo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [name, defect_type, lantai, as_location, status, before_photo, after_photo, id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Defect berhasil diupdate'
    });
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengupdate defect' 
    });
  }
});

// PATCH /api/defects/:id/status - Update defect status only
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status harus diisi' 
      });
    }

    const result = await pool.query(`
      UPDATE defects 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Defect tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Status berhasil diupdate'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengupdate status' 
    });
  }
});

// PATCH /api/defects/:id/after-photo - Upload after photo
router.patch('/:id/after-photo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { after_photo } = req.body;

    if (!after_photo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Foto after harus diisi' 
      });
    }

    const result = await pool.query(`
      UPDATE defects 
      SET after_photo = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [after_photo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Defect tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Foto after berhasil diupload'
    });
  } catch (error) {
    console.error('Upload after photo error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengupload foto after' 
    });
  }
});

// DELETE /api/defects/:id - Delete defect
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM defects WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Defect tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      message: 'Defect berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete defect error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal menghapus defect' 
    });
  }
});

// GET /api/defects/notifications/pending - Get pending notifications
router.get('/notifications/pending', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, u.username as created_by_username 
      FROM defects d 
      LEFT JOIN users u ON d.created_by = u.id 
      WHERE d.notification_at IS NOT NULL 
        AND d.notification_at <= NOW() 
        AND d.is_notified = FALSE
        AND d.status != 'Finish'
      ORDER BY d.notification_at ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pending notifications error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengambil notifikasi' 
    });
  }
});

// PATCH /api/defects/:id/mark-notified - Mark defect as notified
router.patch('/:id/mark-notified', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE defects 
      SET is_notified = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Defect tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Notifikasi berhasil ditandai'
    });
  } catch (error) {
    console.error('Mark notified error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal menandai notifikasi' 
    });
  }
});

export default router;
