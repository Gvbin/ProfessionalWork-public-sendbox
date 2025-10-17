const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  const { name, color, cardId } = req.body;
  
  if (!name || !color || !cardId) {
    return res.status(400).json({ error: 'Name, color and cardId are required' });
  }

  try {
    const label = await prisma.label.create({
      data: {
        name,
        color,
        cardId: Number(cardId)
      }
    });
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create label' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.label.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Label not found' });
  }
});

module.exports = router;