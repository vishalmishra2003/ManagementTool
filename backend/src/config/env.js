import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load the project's .env.developement (note: spelling kept to match the file on disk).
dotenv.config({ path: path.resolve(__dirname, '../../.env.developement') })

function buildMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI

  const { USERNAME, PASSWORD, MONGO_CLUSTER, DB_NAME } = process.env
  if (!USERNAME || !PASSWORD || !MONGO_CLUSTER || MONGO_CLUSTER.includes('REPLACE_WITH')) {
    return null
  }
  const user = encodeURIComponent(USERNAME)
  const pass = encodeURIComponent(PASSWORD)
  const db = DB_NAME || 'apextron'
  return `mongodb+srv://${user}:${pass}@${MONGO_CLUSTER}/${db}?retryWrites=true&w=majority`
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: buildMongoUri(),
  dbName: process.env.DB_NAME || 'apextron',
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_insecure_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
}
