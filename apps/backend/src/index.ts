import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { chatRoutes } from './routes/chatRoutes.js'
import { conversationRoutes } from './routes/conversationRoutes.js'
import { agentRoutes } from './routes/agentRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { logger } from './middleware/logger.js'
import { chatRateLimiter } from './middleware/rateLimiter.js'
import { initializeSemanticRouter } from './utils/semanticRouting.js'
import 'dotenv/config'

const app = new Hono()

app.use('*', logger)

app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'AI Support System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat/messages',
      chatStream: '/api/chat/messages/stream',
      conversations: '/api/conversations',
      agents: '/api/agents'
    }
  })
})

app.get('/api/health', (c) => {
  return c.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  })
})

app.use('/api/chat/*', chatRateLimiter)

app.route('/api/chat', chatRoutes)
app.route('/api/conversations', conversationRoutes)
app.route('/api/agents', agentRoutes)

app.notFound(notFoundHandler)
app.onError(errorHandler)

const port = Number(process.env.PORT) || 3000

// console.log('Initializing semantic router...')
initializeSemanticRouter().then(() => {
  // console.log('Semantic router initialized successfully')

  console.log(`Starting server on http://localhost:${port}`)
  serve({
    fetch: app.fetch,
    port
  })

  // console.log(`Server is running on http://localhost:${port}`)
  // console.log('Available endpoints:')
  // console.log(`  GET  /`)
  // console.log(`  GET  /api/health`)
  // console.log(`  POST /api/chat/messages (rate limited: 10/min)`)
  // console.log(`  POST /api/chat/messages/stream (rate limited: 10/min)`)
  // console.log(`  GET  /api/conversations?userId=<id>`)
  // console.log(`  GET  /api/conversations/:id`)
  // console.log(`  DELETE /api/conversations/:id`)
  // console.log(`  GET  /api/agents`)
  // console.log(`  GET  /api/agents/:type/capabilities`)
}).catch((error) => {
  // console.error('Failed to initialize semantic router:', error)
  process.exit(1)
})
