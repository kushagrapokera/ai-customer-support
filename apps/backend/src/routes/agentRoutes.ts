import { Hono } from 'hono'
import { agentController } from '../controllers/agentController.js'

export const agentRoutes = new Hono()

agentRoutes.get('/', (c) => agentController.listAgents(c))
agentRoutes.get('/:type/capabilities', (c) => agentController.getAgentCapabilities(c))
