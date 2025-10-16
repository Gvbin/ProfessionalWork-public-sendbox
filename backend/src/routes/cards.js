const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  const { title, listId, assignedToId } = req.body;
  if (!title || !listId) {
    return res.status(400).json({ error: 'Title and List ID are required' });
  }

  const maxPosition = await prisma.card.aggregate({
    where: { listId: Number(listId) },
    _max: { position: true },
  });

  const card = await prisma.card.create({
    data: { 
      title, 
      listId: Number(listId),
      position: (maxPosition._max.position ?? -1) + 1,
      assignedToId: assignedToId ? Number(assignedToId) : null
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  res.json(card);
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, assignedToId } = req.body;
  try {
    const updateData = { title };
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId ? Number(assignedToId) : null;
    }
    
    const card = await prisma.card.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(card);
  } catch (error) {
    res.status(404).json({ error: 'Card not found.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.card.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Card not found.' });
  }
});

module.exports = router;