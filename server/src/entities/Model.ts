import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Car } from "./Car";

@Entity({ name: "models" })
export class Model {
  @PrimaryGeneratedColumn()
  model_id!: number;

  @Column()
  model_name!: string;

  @Column("decimal")
  price_peak!: number;

  @Column("decimal")
  price_mid!: number;

  @Column("decimal")
  price_off!: number;

  @OneToMany(() => Car, (car) => car.model)
  cars!: Car[];
}
