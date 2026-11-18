import { WishlistModel } from "../models/wishlistModel.js";

export const WishlistController = {
  async getAll(req, res) {
    try {
      const userId = req.query.userId || req.query.user_id;
      const items = await WishlistModel.getAll(userId);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const item = await WishlistModel.getById(req.params.id);
      res.json(item);
    } catch (err) {
      res.status(404).json({ error: err.message });
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
      const userId = req.query.userId || req.query.user_id || req.body?.user_id;
      await WishlistModel.remove(req.params.id, userId);
      res.json({ message: "Wishlist item removed successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
