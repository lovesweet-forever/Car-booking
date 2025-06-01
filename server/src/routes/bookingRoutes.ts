import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entities/Booking";
import { Car } from "../entities/Car";
import { User } from "../entities/User";

const router = Router();

// Create a new booking
router.post("/", async (req: Request, res: Response) => {
  const { user_id, car_id, start_date, end_date, total_price, average_price } = req.body;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const carRepo = AppDataSource.getRepository(Car);
    const bookingRepo = AppDataSource.getRepository(Booking);

    const user = await userRepo.findOneBy({ user_id });
    const car = await carRepo.findOneBy({ car_id });

    if (!user || !car) {
      res.status(404).json({ error: "User or Car not found" });
      return;
    }

    const booking = bookingRepo.create({
      user_id,
      car_id,
      start_date,
      end_date,
      total_price,
      average_price
    });
    await bookingRepo.save(booking);
    const bookingList = await userRepo.findOne({where: {user_id: user_id}, relations: ["bookings", "bookings.car", "bookings.car.model"]})
    res.status(201).json(bookingList);
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
