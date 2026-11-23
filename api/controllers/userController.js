import { UserModel } from '../models/userModel.js';

export const UserController = {
  async getAll(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getProfile(req, res) {
    try {
      const email = req.query.email;
      const id = req.params.id;
      if (!email && !id) {
        return res.status(400).json({ error: 'Parameter email atau id dibutuhkan' });
      }
      const user = email ? await UserModel.getByEmail(email) : await UserModel.getById(id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password harus diisi' });
      }
      const user = await UserModel.login(email, password);
      res.json(user);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },

  async register(req, res) {
    try {
      const user = await UserModel.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const id = req.params.id || req.body.id || req.body.email;
      const user = await UserModel.update(id, req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
