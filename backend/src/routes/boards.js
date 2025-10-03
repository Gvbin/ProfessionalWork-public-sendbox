const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  const boards = await prisma.board.findMany({ where: { ownerId: req.user.userId } });
  res.json(boards);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const board = await prisma.board.findFirst({
    where: {
      id: Number(id),
      ownerId: req.user.userId,
    },
  });

  if (!board) {
    return res.status(404).json({ error: 'Board not found or access denied' });
  }
  res.json(board);
});

router.post('/', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const board = await prisma.board.create({
    data: { title, ownerId: req.user.userId }
  });
  res.json(board);
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const { id } = req.params;
  const board = await prisma.board.update({
    where: { id: Number(id), ownerId: req.user.userId },
    data: { title }
  });
  res.json(board);
});

// Delete a board
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.board.delete({
      where: { id: Number(id), ownerId: req.user.userId },
    });
    res.json({ success: true });
  } catch (error) {
    // This will catch errors if the board doesn't exist or doesn't belong to the user
    res.status(404).json({ error: 'Board not found or you do not have permission to delete it.' });
  }
});

module.exports = router;