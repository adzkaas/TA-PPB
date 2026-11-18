import { UserModel } from "../models/userModel.js";

export const UserController = {
  async getAll(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const user = await UserModel.getById(req.params.id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email dan password wajib diisi" });
      }
      const user = await UserModel.login(email, password);
      if (!user) {
        return res.status(401).json({ error: "Email atau password salah" });
      }
      res.json({ message: "Login berhasil", user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async register(req, res) {
    try {
      const { username, email, password, avatar_url, role } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, dan password wajib diisi" });
      }
      const user = await UserModel.register({ username, email, password, avatar_url, role });
      res.status(201).json({ message: "Registrasi berhasil", user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const user = await UserModel.update(req.params.id, req.body);
      res.json({ message: "Profil berhasil diperbarui", user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
