const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  const { cardId } = req.query;
  
  if (!cardId) {
    return res.status(400).json({ error: 'cardId is required' });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { cardId: Number(cardId) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { content, cardId } = req.body;
  
  if (!content || !cardId) {
    return res.status(400).json({ error: 'Content and cardId are required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        cardId: Number(cardId),
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.comment.delete({
      where: { id: Number(id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;