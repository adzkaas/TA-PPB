import { WishlistModel } from '../models/wishlistModel.js';

export const WishlistController = {
  async getAll(req, res) {
    try {
      const userId = req.query.user_id;
      const wishlist = await WishlistModel.getAll(userId);
      res.json(wishlist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const item = await WishlistModel.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const targetId = req.params.id;
      const userId = req.query.user_id;
      const result = await WishlistModel.remove(targetId, userId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
