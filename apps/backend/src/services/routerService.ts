import { HybridRouterAgent } from '../agents/routerAgent.js'
import type { RoutingResult } from '../types/agents.js'

const routerAgent = new HybridRouterAgent()

export class RouterService {
    async routeMessage(message: string): Promise<RoutingResult> {
        return await routerAgent.route(message)
    }
}

export const routerService = new RouterService()
