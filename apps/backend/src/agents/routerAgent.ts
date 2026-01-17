// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\agents\routerAgent.ts
import { generateText } from 'ai'
import { getMainModel } from '../config/ai.js'
import { semanticRoute } from '../utils/semanticRouting.js'
import type { AgentType, RoutingResult } from '../types/agents.js'

const LLM_ROUTER_PROMPT = `You are a routing agent for a customer support system.

Analyze the user's query and determine which specialized agent should handle it:

SUPPORT Agent: General inquiries, FAQs, troubleshooting, product help, account issues, technical problems, setup help, feature questions, password resets

ORDER Agent: Order tracking, delivery status, package location, shipping questions, order modifications, cancellations, returns, delivery address changes

BILLING Agent: Payment issues, refunds, invoices, receipts, billing questions, charges, subscription management, payment method updates, transaction disputes

Respond in JSON format:
{
  "agent": "support" | "order" | "billing",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of why this agent was chosen"
}

Be decisive and choose the most appropriate agent even if the query is ambiguous.`

export class HybridRouterAgent {

    private async trySemanticRouting(message: string): Promise<RoutingResult | null> {
        // console.log('\nAttempting semantic routing...')

        const result = await semanticRoute(message)

        if (result) {
            console.log(`Semantic routing successful: ${result.agent} (confidence: ${result.confidence.toFixed(3)})`)
            return {
                agent: result.agent,
                confidence: result.confidence,
                method: 'semantic'
            }
        }

        // console.log('Semantic routing: confidence too low, falling back to LLM')
        return null
    }

    private async llmRouting(message: string): Promise<RoutingResult> {
        // console.log('Using LLM routing...')

        try {
            const { text } = await generateText({
                model: getMainModel(),
                system: LLM_ROUTER_PROMPT,
                prompt: `User message: "${message}"`,
                temperature: 0.1,
            })

            const cleanText = text.trim().replace(/```json\n?|\n?```/g, '')
            const parsed = JSON.parse(cleanText)

            console.log(`LLM routing: ${parsed.agent} (confidence: ${parsed.confidence})`)
            console.log(`Reasoning: ${parsed.reasoning}`)

            return {
                agent: parsed.agent as AgentType,
                confidence: parsed.confidence,
                method: 'llm',
                reasoning: parsed.reasoning
            }

        } catch (error) {
            console.error('LLM routing error:', error)
            return {
                agent: 'support',
                confidence: 0.5,
                method: 'llm',
                reasoning: 'Fallback due to routing error'
            }
        }
    }

    async route(userMessage: string): Promise<RoutingResult> {
        // console.log('\n' + '='.repeat(80))
        // console.log('ROUTING REQUEST')
        // console.log(`Message: "${userMessage}"`)
        // console.log('='.repeat(80))

        const startTime = Date.now()

        const semanticResult = await this.trySemanticRouting(userMessage)
        if (semanticResult) {
            const elapsed = Date.now() - startTime
            // console.log(`Routing completed in ${elapsed}ms (semantic)`)
            // console.log('='.repeat(80) + '\n')
            return semanticResult
        }

        const llmResult = await this.llmRouting(userMessage)
        const elapsed = Date.now() - startTime
        // console.log(`Routing completed in ${elapsed}ms (LLM)`)
        // console.log('='.repeat(80) + '\n')

        return llmResult
    }
}
