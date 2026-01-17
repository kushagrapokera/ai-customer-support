import { generateText, streamText } from 'ai'
import { getMainModel } from '../config/ai.js'
import { orderTools } from '../tools/orderTools.js'

const ORDER_AGENT_PROMPT = `You are a specialized Order Support Agent for a customer support system.

Your responsibilities:
- Help customers track their orders and packages
- Provide delivery status updates
- Assist with order modifications and cancellations
- Answer shipping and delivery questions

You have access to tools to:
1. Get complete order details (items, status, tracking)
2. Check delivery status and tracking information

When a customer asks about an order:
1. Use the appropriate tool to fetch real data from the database
2. Provide clear, friendly responses
3. If an order is not found, politely ask for the correct order number

Be helpful, professional, and proactive in providing solutions.`

export class OrderAgent {
    async handle(userMessage: string, conversationContext?: string): Promise<string> {
        try {
            let prompt = userMessage

            if (conversationContext) {
                prompt = `${conversationContext}\n${userMessage}`
            }

            const { text } = await generateText({
                model: getMainModel(),
                system: ORDER_AGENT_PROMPT,
                prompt: prompt,
                tools: orderTools,
                maxSteps: 5,
            })

            return text
        } catch (error) {
            console.error('Order Agent error:', error)
            return 'I apologize, but I am having trouble processing your order request right now. Please try again.'
        }
    }

    async handleStream(userMessage: string, conversationContext?: string) {
        let prompt = userMessage

        if (conversationContext) {
            prompt = `${conversationContext}\n${userMessage}`
        }

        const result = await streamText({
            model: getMainModel(),
            system: ORDER_AGENT_PROMPT,
            prompt: prompt,
            tools: orderTools,
            maxSteps: 5,
        })

        return result
    }
}
