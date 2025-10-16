const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  const { boardId } = req.query;
  
  try {
    if (boardId) {
      // Récupérer le board avec ses membres
      const board = await prisma.board.findFirst({
        where: {
          id: Number(boardId),
          OR: [
            { ownerId: req.user.userId },
            { members: { some: { userId: req.user.userId } } }
          ]
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!board) {
        return res.status(404).json({ error: 'Board not found or access denied' });
      }

      // Combiner le propriétaire et les membres
      const users = [
        board.owner,
        ...board.members.map(m => m.user)
      ];

      // Retirer les doublons
      const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
      
      res.json(uniqueUsers);
    } else {
      // Retourner tous les utilisateurs (pour ajouter des membres)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true
        }
      });
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;