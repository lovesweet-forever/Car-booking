import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Booking } from "./Booking";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "date" })
  expire_date!: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings!: Booking[];
}
