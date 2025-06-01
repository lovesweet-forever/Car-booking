import { AppDataSource } from "../data-source";
import { Car } from "../entities/Car";
import { Model } from "../entities/Model";

const cars = [
  { brand: 'Toyota',   model: 'Yaris',   stock: 3, prices: { peak: 98.43,  mid: 76.89, off: 53.65 } },
  { brand: 'Seat',     model: 'Ibiza',   stock: 5, prices: { peak: 85.12,  mid: 65.73, off: 46.85 } },
  { brand: 'Nissan',   model: 'Qashqai', stock: 2, prices: { peak: 101.46, mid: 82.94, off: 59.87 } },
  { brand: 'Jaguar',   model: 'e-pace',  stock: 1, prices: { peak: 120.54, mid: 91.35, off: 70.27 } },
  { brand: 'Mercedes', model: 'Vito',    stock: 2, prices: { peak: 109.16, mid: 89.64, off: 64.97 } }
];

async function seedCars() {
  await AppDataSource.initialize();
  const modelRepo = AppDataSource.getRepository(Model);
  const carRepo = AppDataSource.getRepository(Car);

  for (const car of cars) {
    // Create model
    const model = modelRepo.create({
      model_name: car.model,
      price_peak: car.prices.peak,
      price_mid: car.prices.mid,
      price_off: car.prices.off,
    });

    const savedModel = await modelRepo.save(model);

    // Create multiple cars for stock count
    for (let i = 0; i < car.stock; i++) {
      const newCar = carRepo.create({
        brand: car.brand,
        model: savedModel,
        model_id: savedModel.model_id, // necessary for some setups
      });
      await carRepo.save(newCar);
    }
  }

  console.log("✅ Cars and models seeded successfully.");
  await AppDataSource.destroy();
}

seedCars().catch((err) => {
  console.error("❌ Seeding failed:", err);
  AppDataSource.destroy();
});
