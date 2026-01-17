import type { Context } from 'hono'
import { AppError } from '../middleware/errorHandler.js'

const AGENT_DEFINITIONS = {
    support: {
        type: 'support',
        name: 'Support Agent',
        description: 'Handles general support inquiries, FAQs, and troubleshooting',
        capabilities: [
            'Search FAQ database',
            'Answer product questions',
            'Help with account issues',
            'Provide troubleshooting guidance',
            'Explain features and functionality'
        ],
        tools: [
            {
                name: 'searchFAQ',
                description: 'Search the FAQ database for relevant articles',
                parameters: ['query']
            }
        ]
    },
    order: {
        type: 'order',
        name: 'Order Agent',
        description: 'Handles order status, tracking, modifications, and cancellations',
        capabilities: [
            'Track order status',
            'Check delivery status',
            'Provide tracking information',
            'Answer shipping questions',
            'Help with order modifications'
        ],
        tools: [
            {
                name: 'getOrderDetails',
                description: 'Fetch complete order details by order number',
                parameters: ['orderNumber']
            },
            {
                name: 'checkDeliveryStatus',
                description: 'Check delivery status and tracking information',
                parameters: ['orderNumber']
            }
        ]
    },
    billing: {
        type: 'billing',
        name: 'Billing Agent',
        description: 'Handles payment issues, refunds, invoices, and subscription queries',
        capabilities: [
            'Retrieve invoice details',
            'Check refund status',
            'Process payment inquiries',
            'Handle billing disputes',
            'Manage subscription queries'
        ],
        tools: [
            {
                name: 'getInvoiceDetails',
                description: 'Retrieve invoice details by invoice number',
                parameters: ['invoiceNumber']
            },
            {
                name: 'checkRefundStatus',
                description: 'Check refund status for a transaction',
                parameters: ['transactionId']
            }
        ]
    }
}

export class AgentController {
    listAgents(c: Context) {
        const agents = Object.values(AGENT_DEFINITIONS).map(agent => ({
            type: agent.type,
            name: agent.name,
            description: agent.description,
            capabilities: agent.capabilities
        }))

        return c.json({
            success: true,
            data: agents,
            count: agents.length
        })
    }

    getAgentCapabilities(c: Context) {
        const agentType = c.req.param('type')

        if (!agentType || !['support', 'order', 'billing'].includes(agentType)) {
            throw new AppError('Invalid agent type. Must be: support, order, or billing', 400)
        }

        const agent = AGENT_DEFINITIONS[agentType as keyof typeof AGENT_DEFINITIONS]

        if (!agent) {
            throw new AppError(`Agent type '${agentType}' not found`, 404)
        }

        return c.json({
            success: true,
            data: {
                type: agent.type,
                name: agent.name,
                description: agent.description,
                capabilities: agent.capabilities,
                tools: agent.tools
            }
        })
    }
}

export const agentController = new AgentController()
