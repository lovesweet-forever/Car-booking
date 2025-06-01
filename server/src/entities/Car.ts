import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Model } from "./Model";
import { Booking } from "./Booking";

@Entity({ name: "cars" })
export class Car {
  @PrimaryGeneratedColumn()
  car_id!: number;

  @Column()
  brand!: string;

  @Column()
  model_id!: number;

  @ManyToOne(() => Model, (model) => model.cars)
  @JoinColumn({ name: "model_id" })
  model!: Model;

  @OneToMany(() => Booking, (booking) => booking.car)
  bookings!: Booking[];
}
