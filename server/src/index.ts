import express from "express";
import cors from 'cors';
import { AppDataSource } from "./data-source";
import bookingRoutes from "./routes/bookingRoutes";
import availableCarsRoutes from "./routes/availableCarsRoutes";

const app = express();
app.use(cors())
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Data Source has been initialized!");

    app.use("/bookings", bookingRoutes);
    app.use("/available-cars", availableCarsRoutes);

    app.listen(3000, () => {
      console.log("✅ Server running at http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("❌ Error initializing Data Source:", err);
  });
