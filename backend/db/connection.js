import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

let connectionString;

switch (process.env.NODE_ENV) {
  case 'test':
    connectionString = process.env.DATABASE_URL_TEST;
    break;
  case 'production':
    connectionString = process.env.DATABASE_URL_PROD;
    break;
  default:
    connectionString = process.env.DATABASE_URL_DEV;
}

export const pool = new Pool({ connectionString });
