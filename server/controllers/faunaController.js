import { FaunaModel } from '../models/faunaModel.js';

function parseRange(str) {
  if (!str) return null;
  const nums = String(str).match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const first = parseFloat(nums[0]);
  const second = nums.length > 1 ? parseFloat(nums[1]) : first;
  return {
    min: Math.min(first, second),
    max: Math.max(first, second),
  };
}

function checkOverlap(range1, range2, unit = '') {
  if (!range1 || !range2) {
    return { match: false, overlapMin: null, overlapMax: null, formatted: null, parsed: false };
  }
  const overlapMin = Math.max(range1.min, range2.min);
  const overlapMax = Math.min(range1.max, range2.max);
  const match = overlapMin <= overlapMax;
  const formatted = match
    ? overlapMin === overlapMax
      ? `${overlapMin}${unit}`
      : `${overlapMin}–${overlapMax}${unit}`
    : null;
  return { match, overlapMin, overlapMax, formatted, parsed: true };
}

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
      const item = await FaunaModel.getById(req.params.id);
      res.json(item);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const item = await FaunaModel.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const item = await FaunaModel.update(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await FaunaModel.remove(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async compare(req, res) {
    try {
      const { id1, id2 } = req.body;
      if (!id1 || !id2) {
        return res.status(400).json({ error: 'Dua ID biota (id1 dan id2) harus dipilih untuk dibandingkan.' });
      }
      if (String(id1) === String(id2)) {
        return res.status(400).json({ error: 'Pilih dua biota yang berbeda untuk dibandingkan.' });
      }

      const [fauna1, fauna2] = await Promise.all([
        FaunaModel.getById(id1),
        FaunaModel.getById(id2),
      ]);

      const temp1 = parseRange(fauna1.water_temp);
      const temp2 = parseRange(fauna2.water_temp);
      const ph1 = parseRange(fauna1.ph_range);
      const ph2 = parseRange(fauna2.ph_range);

      const tempResult = checkOverlap(temp1, temp2, '°C');
      const phResult = checkOverlap(ph1, ph2, '');

      const compatible = tempResult.match && phResult.match;

      let message = '';
      if (compatible) {
        message = `${fauna1.name} dan ${fauna2.name} bisa disatukan dalam 1 tank! Suhu air dan pH keduanya saling sesuai.`;
      } else if (!tempResult.parsed || !phResult.parsed) {
        message = 'Data suhu air atau pH salah satu biota belum lengkap untuk dibandingkan.';
      } else if (!tempResult.match && !phResult.match) {
        message = `${fauna1.name} dan ${fauna2.name} tidak disarankan disatukan dalam 1 tank karena rentang suhu air dan pH tidak sesuai.`;
      } else if (!tempResult.match) {
        message = `${fauna1.name} dan ${fauna2.name} tidak disarankan disatukan dalam 1 tank karena rentang suhu air tidak sesuai.`;
      } else {
        message = `${fauna1.name} dan ${fauna2.name} tidak disarankan disatukan dalam 1 tank karena rentang pH air tidak sesuai.`;
      }

      res.json({
        compatible,
        tempMatch: tempResult.match,
        phMatch: phResult.match,
        recommendedTemp: tempResult.formatted,
        recommendedPh: phResult.formatted,
        message,
        fauna1,
        fauna2,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
