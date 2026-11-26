import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import plantRoutes from '../server/routes/plantRoutes.js';
import faunaRoutes from '../server/routes/faunaRoutes.js';
import wishlistRoutes from '../server/routes/wishlistRoutes.js';
import userRoutes from '../server/routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes API Web Service (sesuai Modul 1)
app.use('/api/plants', plantRoutes);
app.use('/api/fauna', faunaRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);

// Root test endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AquascapeHub RESTful API is active and running',
    endpoints: [
      '/api/plants',
      '/api/fauna',
      '/api/wishlist',
      '/api/users',
    ],
  });
});

const port = process.env.PORT || 3000;

// Jalankan server jika dijalankan secara langsung (lokal / node api/index.js)
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server API running on port ${port}`);
  });
}

export default app;
