import logger from './logger';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env.example' });

interface VarsDefinition {
  ENVIRONMENT: string;
  MONGODB_URI: string;
  AMQP_URI: string;
  PORT: number;
}

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  logger.debug('Using .env.example file to supply config environment variables');
  dotenv.config({ path: '.env.example' });
}

const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production';

const MONGODB_URI = prod ? process.env['MONGODB_URI'] : process.env['MONGODB_URI_LOCAL'];

if (!MONGODB_URI) {
  logger.error('No mongo connection string. Set MONGODB_URI environment variable.');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT);

const AMQP_URI = prod ? process.env['AMQP_URI'] : process.env['AMQP_URI_LOCAL'];
if (!AMQP_URI) {
  logger.error('Invalid AMQP config specified. Set AMQP_URI environment variable.');
  process.exit(1);
}

export const vars: VarsDefinition = {
  ENVIRONMENT,
  MONGODB_URI,
  PORT,
  AMQP_URI
};
