import { env } from './src/config/env.js'
import { connectDB } from './src/config/db.js'
import { createApp } from './src/app.js'

async function start() {
  try {
    await connectDB()
    const app = createApp()
    app.listen(env.port, () => {
      console.log(`✓ API running at http://localhost:${env.port}`)
    })
  } catch (err) {
    console.error('✗ Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
