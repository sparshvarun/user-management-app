const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });


const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};


router.get('/', async (_, res) => {
  try {
    const query = `
      SELECT
        u.*,
        (SELECT COUNT(*) FROM followers f WHERE f.followee_id = u.id) AS followers,
        (SELECT COUNT(*) FROM followers f WHERE f.follower_id = u.id) AS following
      FROM users u
      ORDER BY u.id ASC;
    `;
    const { rows } = await pool.query(query);
    rows.forEach(r => r.age = calcAge(r.dob));
    res.json(rows);
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, phone, dob, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, dob, avatar_url]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /users error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dob } = req.body;
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    const fields = ['name=$1', 'email=$2', 'phone=$3', 'dob=$4'];
    const values = [name, email, phone, dob];
    if (avatar_url) {
      fields.push('avatar_url=$5');
      values.push(avatar_url);
    }
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id=${id} RETURNING *`,
      values
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


router.post('/:id/follow', async (req, res) => {
  try {
    const followerId = parseInt(req.params.id);
    const { targetId } = req.body;
    if (!targetId || followerId === targetId) {
      return res.status(400).json({ error: 'Invalid target user' });
    }
    await pool.query(
      'INSERT INTO followers (follower_id, followee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, targetId]
    );
    res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.error('Error in /follow:', err);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

router.delete('/:id/follow/:targetId', async (req, res) => {
  try {
    const followerId = parseInt(req.params.id);
    const targetId = parseInt(req.params.targetId);
    if (followerId === targetId) {
      return res.status(400).json({ error: 'Cannot unfollow self' });
    }
    await pool.query(
      'DELETE FROM followers WHERE follower_id = $1 AND followee_id = $2',
      [followerId, targetId]
    );
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('Error in /unfollow:', err);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});


router.get('/:id/following', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await pool.query(
      'SELECT followee_id FROM followers WHERE follower_id = $1',
      [id]
    );
    res.json({ following: rows.map(r => r.followee_id) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get following list' });
  }
});

module.exports = router;

