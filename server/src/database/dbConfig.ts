import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

const pgOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  transform: {
    ...postgres.camel,
  },
};

export const sql = postgres(pgOptions);
