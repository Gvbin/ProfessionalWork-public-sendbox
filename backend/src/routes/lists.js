const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  const { boardId } = req.query;
  if (!boardId) return res.status(400).json({ error: 'Board ID is required' });

  const board = await prisma.board.findFirst({
    where: { 
      id: Number(boardId),
      OR: [
        { ownerId: req.user.userId },
        { members: { some: { userId: req.user.userId } } }
      ]
    },
  });
  if (!board) return res.status(404).json({ error: 'Board not found or access denied' });

  const lists = await prisma.list.findMany({
    where: { boardId: Number(boardId) },
    include: { 
      cards: { 
        orderBy: { position: 'asc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      } 
    },
    orderBy: { position: 'asc' },
  });
  res.json(lists);
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, boardId } = req.body;
  const board = await prisma.board.findFirst({
    where: { 
      id: Number(boardId),
      OR: [
        { ownerId: req.user.userId },
        { members: { some: { userId: req.user.userId } } }
      ]
    },
  });
  if (!board) return res.status(404).json({ error: 'Board not found or access denied' });

  const maxPosition = await prisma.list.aggregate({
    where: { boardId: Number(boardId) },
    _max: { position: true },
  });

  const list = await prisma.list.create({
    data: { 
      title, 
      boardId: Number(boardId),
      position: (maxPosition._max.position ?? -1) + 1 
    },
    include: { cards: true },
  });
  res.json(list);
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const list = await prisma.list.update({
      where: { id: Number(id) },
      data: { title },
    });
    res.json(list);
  } catch (error) {
    res.status(404).json({ error: 'List not found.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.list.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'List not found.' });
  }
});

module.exports = router;