import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

// GET /api/members - Get all members with user info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.user_id,
        u.username,
        u.role,
        m.created_at,
        inviter.username as invited_by_username
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN users inviter ON m.invited_by = inviter.id
      ORDER BY m.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal mengambil data member' 
    });
  }
});

// POST /api/members/invite - Invite new member (Manager only)
router.post('/invite', authenticateToken, requireManager, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username harus diisi' 
      });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, username, role FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User dengan username tersebut tidak ditemukan' 
      });
    }

    const user = userResult.rows[0];

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT id FROM members WHERE user_id = $1',
      [user.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'User sudah menjadi member' 
      });
    }

    // Add as member
    const result = await pool.query(`
      INSERT INTO members (user_id, invited_by) 
      VALUES ($1, $2) 
      RETURNING id, user_id, created_at
    `, [user.id, req.user.id]);

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        username: user.username,
        role: user.role
      },
      message: `${username} berhasil ditambahkan sebagai member`
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal menambahkan member' 
    });
  }
});

// DELETE /api/members/:id - Remove member (Manager only)
router.delete('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM members WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      message: 'Member berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal menghapus member' 
    });
  }
});

export default router;
