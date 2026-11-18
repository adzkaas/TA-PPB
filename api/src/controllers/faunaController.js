import { FaunaModel } from "../models/faunaModel.js";

export const FaunaController = {
  async getAll(req, res) {
    try {
      const fauna = await FaunaModel.getAll();
      res.json(fauna);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const fauna = await FaunaModel.getById(req.params.id);
      res.json(fauna);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const fauna = await FaunaModel.create(req.body);
      res.status(201).json(fauna);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const fauna = await FaunaModel.update(req.params.id, req.body);
      res.json(fauna);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await FaunaModel.remove(req.params.id);
      res.json({ message: "Fauna deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
