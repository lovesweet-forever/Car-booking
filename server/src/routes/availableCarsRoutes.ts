import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Car } from "../entities/Car";
import { Booking } from "../entities/Booking";
import { User } from "../entities/User";
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const router = Router();

function getPrice(start_date: string, end_date: string, price_peak: number, price_mid: number, price_off: number) {
    const start = dayjs(start_date);
    const end = dayjs(end_date);

    let total_price: number = 0;
    let total_days: number = 0;

    let current = start.clone();

    while (current.isSameOrBefore(end, 'day')) {
        const year = current.year();
        const month = current.month() + 1;
        const day = current.date();

        let fee: number;

        const date = current;

        const inPeak = date.isSameOrAfter(dayjs(`${year}-06-01`)) && date.isBefore(dayjs(`${year}-09-16`));
        const inMid =
            (date.isSameOrAfter(dayjs(`${year}-09-15`)) && date.isSameOrBefore(dayjs(`${year}-10-31`))) ||
            (date.isSameOrAfter(dayjs(`${year}-03-01`)) && date.isBefore(dayjs(`${year}-06-01`)));
        const inOff =
            date.isBefore(dayjs(`${year}-03-01`)) || date.isSameOrAfter(dayjs(`${year}-11-01`));

        if (inPeak) {
            fee = price_peak;
        } else if (inMid) {
            fee = price_mid;
        } else if (inOff) {
            fee = price_off;
        } else {
            fee = price_mid;
        }

        total_price = total_price * 1.0 + fee * 1.0;
        total_days += 1;
        current = current.add(1, 'day');
    }

    const average_price = total_days > 0 ? total_price / total_days : 0;

    return { total_price, average_price }
}

router.post("/", async (req: Request, res: Response) => {
    const { email, start_date, end_date, expire_date } = req.body;

    const start = dayjs(start_date);
    const end = dayjs(end_date);
    const expire = dayjs(expire_date);

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
        res.status(400).json({ errorCode: 401 });
        return;
    }

    if (expire.isBefore(end)) {
        res.status(400).json({ errorCode: 402 });
        return;
    }
    try {
        const userRepo = AppDataSource.getRepository(User);
        const carRepo = AppDataSource.getRepository(Car);
        const bookingRepo = AppDataSource.getRepository(Booking);

        // Create a new user if not exist
        let user = await userRepo.findOne({ where: { email } })
        let user_id = user?.user_id;
        if (!user) {
            let newUser = userRepo.create(
                {
                    email: email,
                    expire_date: expire_date,
                    name: "Default Username",
                    password: "DefaultPassword"
                })
            newUser = await userRepo.save(newUser)
            user_id = newUser.user_id
        }

        // Validate booking
        let result = await bookingRepo
            .createQueryBuilder("bookings")
            .select(["bookings.car_id"])
            .where("bookings.start_date <= :end_date",{end_date})
            .andWhere("bookings.end_date >= :start_date",{start_date})
            .andWhere("bookings.user_id = :user_id",{user_id})
            .getMany();

        if (result.length) {
            const bookingList = await userRepo.findOne({ where: { user_id: user_id }, relations: ["bookings", "bookings.car", "bookings.car.model"] })
            res.status(400).json({ errorCode: 403, bookingList })
            return;
        }

        // Find available cars
        let resultCars = await carRepo
            .createQueryBuilder("cars")
            .innerJoin("cars.model", "models")
            .select([
                "cars.brand AS brand",
                "cars.model_id AS model_id",
                "MIN(cars.car_id) AS car_id",
                "models.model_name AS model_name",
                "models.price_peak AS price_peak",
                "models.price_mid AS price_mid",
                "models.price_off AS price_off",
                "COUNT(cars.car_id) AS count"
            ])
            .where(qb => {
                const subQuery = qb
                    .subQuery()
                    .select("bookings.car_id")
                    .from("bookings", "bookings")
                    .where(`
                        (bookings.start_date <= :start_date AND bookings.end_date >= :start_date)
                        OR (bookings.start_date <= :end_date AND bookings.end_date >= :end_date)
                        OR (bookings.start_date >= :start_date AND bookings.end_date <= :end_date)
                    `, {
                        start_date,
                        end_date,
                    })
                    .getQuery();
                return "cars.car_id NOT IN " + subQuery;
            })
            .groupBy("cars.model_id")
            .addGroupBy("cars.brand")
            .addGroupBy("models.model_name")
            .addGroupBy("models.price_peak")
            .addGroupBy("models.price_mid")
            .addGroupBy("models.price_off")
            .getRawMany();
        
        const resultX = resultCars.map((item: any) => {
            const { total_price, average_price } = getPrice(start_date, end_date, item.price_peak, item.price_mid, item.price_off)
            return { ...item, total_price: total_price.toFixed(2), average_price: average_price.toFixed(2) }
        })

        // Find booking list
        const bookingList = await userRepo.findOne({ where: { user_id: user_id }, relations: ["bookings", "bookings.car", "bookings.car.model"] })
        
        res.json({ available: resultX, user_id, bookingList });
    } catch (err) {
        console.error("Error finding available cars:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
