import { generateText, streamText } from 'ai'
import { getMainModel } from '../config/ai.js'
import { supportTools } from '../tools/supportTools.js'

const SUPPORT_AGENT_PROMPT = `You are a specialized General Support Agent for a customer support system.

Your responsibilities:
- Answer general questions and FAQs
- Help with troubleshooting and technical issues
- Assist with account problems (passwords, login, etc.)
- Explain product features and functionality
- Guide users through setup and configuration

You have access to tools to:
1. Search the FAQ database for relevant articles

When helping customers:
1. Search FAQs first to provide accurate, documented answers
2. Be clear, patient, and thorough in explanations
3. Offer step-by-step guidance when needed

Be friendly, helpful, and ensure customers feel supported.`

export class SupportAgent {
    async handle(userMessage: string, conversationContext?: string): Promise<string> {
        try {
            let prompt = userMessage

            if (conversationContext) {
                prompt = `${conversationContext}\n${userMessage}`
            }

            const { text } = await generateText({
                model: getMainModel(),
                system: SUPPORT_AGENT_PROMPT,
                prompt: prompt,
                tools: supportTools,
                maxSteps: 5,
            })

            return text
        } catch (error) {
            console.error('Support Agent error:', error)
            return 'I apologize, but I am having trouble accessing support resources right now. Please try again.'
        }
    }

    async handleStream(userMessage: string, conversationContext?: string) {
        let prompt = userMessage

        if (conversationContext) {
            prompt = `${conversationContext}\n${userMessage}`
        }

        const result = await streamText({
            model: getMainModel(),
            system: SUPPORT_AGENT_PROMPT,
            prompt: prompt,
            tools: supportTools,
            maxSteps: 5,
        })

        return result
    }
}
