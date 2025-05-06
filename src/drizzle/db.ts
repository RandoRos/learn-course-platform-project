import { env } from '@/data/env/server'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export const db = drizzle(
  `postgres://${env.DB_USER}:${env.DB_PASSWORD}@localhost:5432/${env.DB_NAME}`
)
