import { PlantModel } from '../models/plantModel.js';

export const PlantController = {
  async getAll(req, res) {
    try {
      const plants = await PlantModel.getAll();
      res.json(plants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const plant = await PlantModel.getById(req.params.id);
      res.json(plant);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const plant = await PlantModel.create(req.body);
      res.status(201).json(plant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const plant = await PlantModel.update(req.params.id, req.body);
      res.json(plant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await PlantModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
