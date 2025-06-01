import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Car } from "./Car";

@Entity({ name: "bookings" })
export class Booking {
    price_off(start_date: any, end_date: any, price_peak: number, price_mid: number, price_off: any): { total_price: any; average_price: any; } {
        throw new Error("Method not implemented.");
    }
  @PrimaryGeneratedColumn()
  book_id!: number;

  @Column()
  user_id!: number;

  @Column()
  car_id!: number;

  @Column({ type: "date" })
  start_date!: Date;

  @Column({ type: "date" })
  end_date!: Date;

  @Column("decimal")
  total_price!: number;
  
  @Column("decimal")
  average_price!: number;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Car, (car) => car.bookings)
  @JoinColumn({ name: "car_id" })
  car!: Car;
}
