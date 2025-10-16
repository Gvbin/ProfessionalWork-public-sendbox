const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  const ownedBoards = await prisma.board.findMany({ 
    where: { ownerId: req.user.userId },
    include: { 
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } } 
    }
  });
  
  const sharedBoards = await prisma.board.findMany({
    where: {
      members: {
        some: { userId: req.user.userId }
      },
      NOT: {
        ownerId: req.user.userId
      }
    },
    include: { 
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } }
    }
  });

  res.json([...ownedBoards, ...sharedBoards]);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const board = await prisma.board.findFirst({
    where: {
      id: Number(id),
      OR: [
        { ownerId: req.user.userId },
        { members: { some: { userId: req.user.userId } } }
      ]
    },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
  });

  if (!board) {
    return res.status(404).json({ error: 'Board not found or access denied' });
  }
  res.json(board);
});

router.post('/', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const board = await prisma.board.create({
    data: { title, ownerId: req.user.userId },
    include: { lists: true, members: true },
  });
  res.json(board);
});

router.post('/:id/members', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const board = await prisma.board.findFirst({
    where: { id: Number(id), ownerId: req.user.userId }
  });

  if (!board) {
    return res.status(404).json({ error: 'Board not found or you are not the owner' });
  }

  try {
    const member = await prisma.boardMember.create({
      data: {
        boardId: Number(id),
        userId: Number(userId)
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: 'User already a member or does not exist' });
  }
});

router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  const { id, userId } = req.params;

  const board = await prisma.board.findFirst({
    where: { id: Number(id), ownerId: req.user.userId }
  });

  if (!board) {
    return res.status(404).json({ error: 'Board not found or you are not the owner' });
  }

  try {
    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId: Number(id),
          userId: Number(userId)
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Member not found' });
  }
});

router.post('/reorder', authenticateToken, async (req, res) => {
  const { lists } = req.body;
  if (!lists) return res.status(400).json({ error: 'Invalid data' });

  try {
    const updates = [];
    lists.forEach((list, listIndex) => {
      updates.push(
        prisma.list.update({
          where: { id: list.id },
          data: { position: listIndex },
        })
      );
      list.cards.forEach((card, cardIndex) => {
        updates.push(
          prisma.card.update({
            where: { id: card.id },
            data: { position: cardIndex, listId: list.id },
          })
        );
      });
    });

    await prisma.$transaction(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder board elements.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const { id } = req.params;
  const board = await prisma.board.update({
    where: { 
      id: Number(id),
      OR: [
        { ownerId: req.user.userId },
        { members: { some: { userId: req.user.userId } } }
      ]
    },
    data: { title }
  });
  res.json(board);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.board.delete({
      where: { id: Number(id), ownerId: req.user.userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Board not found or you do not have permission to delete it.' });
  }
});

module.exports = router;