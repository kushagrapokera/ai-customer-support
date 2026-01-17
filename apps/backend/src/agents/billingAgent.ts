import { generateText, streamText } from 'ai'
import { getMainModel } from '../config/ai.js'
import { billingTools } from '../tools/billingTools.js'

const BILLING_AGENT_PROMPT = `You are a specialized Billing Support Agent for a customer support system.

Your responsibilities:
- Help customers with payment issues
- Process refund requests and check refund status
- Provide invoice information
- Assist with billing questions and disputes
- Help manage subscriptions and payment methods

You have access to tools to:
1. Retrieve invoice details
2. Check refund status for transactions

When a customer has a billing question:
1. Use the appropriate tool to fetch real data
2. Explain charges and payments clearly
3. Be empathetic with payment issues
4. Provide clear next steps for resolutions

Be professional, understanding, and helpful with sensitive financial matters.`

export class BillingAgent {
  async handle(userMessage: string, conversationContext?: string): Promise<string> {
    try {
      let prompt = userMessage

      if (conversationContext) {
        prompt = `${conversationContext}\n${userMessage}`
      }

      const { text } = await generateText({
        model: getMainModel(),
        system: BILLING_AGENT_PROMPT,
        prompt: prompt,
        tools: billingTools,
        maxSteps: 5,
      })

      return text
    } catch (error) {
      console.error('Billing Agent error:', error)
      return 'I apologize, but I am having trouble accessing billing information right now. Please try again.'
    }
  }

  async handleStream(userMessage: string, conversationContext?: string) {
    let prompt = userMessage

    if (conversationContext) {
      prompt = `${conversationContext}\n${userMessage}`
    }

    const result = await streamText({
      model: getMainModel(),
      system: BILLING_AGENT_PROMPT,
      prompt: prompt,
      tools: billingTools,
      maxSteps: 5,
    })

    return result
  }
}
