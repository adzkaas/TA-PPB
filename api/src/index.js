import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import plantRoutes from "./routes/plantRoutes.js";
import faunaRoutes from "./routes/faunaRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AquascapeHub API is running 🌿" });
});

app.use("/api/plants", plantRoutes);
app.use("/api/fauna", faunaRoutes);
app.use("/api/wishlists", wishlistRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AquascapeHub API running on port ${port}`);
});

export default app;
