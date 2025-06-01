import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateInitialTables1712550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // USERS
    const hasUsers = await queryRunner.hasTable("users");
    if (!hasUsers) {
      await queryRunner.createTable(new Table({
        name: "users",
        columns: [
          { name: "user_id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "name", type: "varchar", length: "255" },
          { name: "email", type: "varchar", length: "255", isUnique: true },
          { name: "password", type: "varchar", length: "255" },
          { name: "expire_date", type: "date" },
        ],
      }));
    }

    // MODELS
    const hasModels = await queryRunner.hasTable("models");
    if (!hasModels) {
      await queryRunner.createTable(new Table({
        name: "models",
        columns: [
          { name: "model_id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "model_name", type: "varchar", length: "255" },
          { name: "price_peak", type: "decimal", precision: 10, scale: 2 },
          { name: "price_mid", type: "decimal", precision: 10, scale: 2 },
          { name: "price_off", type: "decimal", precision: 10, scale: 2 },
        ],
      }));
    }

    // CARS
    const hasCars = await queryRunner.hasTable("cars");
    if (!hasCars) {
      await queryRunner.createTable(new Table({
        name: "cars",
        columns: [
          { name: "car_id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "brand", type: "varchar", length: "255" },
          { name: "model_id", type: "int" },
        ],
      }));

      await queryRunner.createForeignKey("cars", new TableForeignKey({
        columnNames: ["model_id"],
        referencedTableName: "models",
        referencedColumnNames: ["model_id"],
        onDelete: "CASCADE",
      }));
    }

    // BOOKINGS
    const hasBookings = await queryRunner.hasTable("bookings");
    if (!hasBookings) {
      await queryRunner.createTable(new Table({
        name: "bookings",
        columns: [
          { name: "book_id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "int" },
          { name: "car_id", type: "int" },
          { name: "start_date", type: "date" },
          { name: "end_date", type: "date" },
          { name: "total_price", type: "decimal", precision: 10, scale: 2 },
          { name: "average_price", type: "decimal", precision: 10, scale: 2 },
        ],
      }));

      await queryRunner.createForeignKey("bookings", new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["user_id"],
        onDelete: "CASCADE",
      }));

      await queryRunner.createForeignKey("bookings", new TableForeignKey({
        columnNames: ["car_id"],
        referencedTableName: "cars",
        referencedColumnNames: ["car_id"],
        onDelete: "CASCADE",
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("bookings", true);
    await queryRunner.dropTable("cars", true);
    await queryRunner.dropTable("models", true);
    await queryRunner.dropTable("users", true);
  }
}
