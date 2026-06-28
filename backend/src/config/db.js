import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error(
      'MongoDB connection is not configured. Set MONGO_CLUSTER (and DB_NAME) or MONGO_URI in backend/.env.developement',
    )
  }

  mongoose.set('strictQuery', true)
  // Pass dbName explicitly so DB_NAME is honoured even when the connection
  // string has no database in its path (e.g. ".../?appName=...").
  await mongoose.connect(env.mongoUri, { dbName: env.dbName })
  console.log(`✓ MongoDB connected (db: ${env.dbName})`)
}
