// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\utils\semanticRouting.ts
import { getEmbedding } from '../config/ai.js'
import type { AgentType } from '../types/agents.js'

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

const AGENT_EXAMPLES = {
    support: [
        "How do I reset my password?",
        "I can't log into my account",
        "The product is not working properly",
        "How do I use this feature?",
        "I need help with setup",
        "Technical issue with the app"
    ],
    order: [
        "Where is my package?",
        "Track my order",
        "Cancel my order",
        "Order status update",
        "When will my order arrive?",
        "Track delivery status"
    ],
    billing: [
        "I need a refund",
        "Issue with payment",
        "Invoice not received",
        "Payment failed",
        "Wrong amount charged",
        "Refund status check"
    ]
}

let exampleEmbeddingsCache: Record<AgentType, number[][]> | null = null

async function getExampleEmbeddings(): Promise<Record<AgentType, number[][]>> {
    if (exampleEmbeddingsCache) {
        return exampleEmbeddingsCache
    }

    // process.stdout.write('Computing embeddings...')

    const embeddings: Record<AgentType, number[][]> = {
        support: [],
        order: [],
        billing: []
    }

    for (const agentType of ['support', 'order', 'billing'] as AgentType[]) {
        const examples = AGENT_EXAMPLES[agentType]
        for (const example of examples) {
            try {
                const embedding = await getEmbedding(example)
                embeddings[agentType].push(embedding)
                // process.stdout.write('.')
            } catch (error) {
                console.error(`\nFailed to embed: "${example}"`, error)
            }
        }
    }

    // console.log(' Done!')
    exampleEmbeddingsCache = embeddings
    return embeddings
}

export async function semanticRoute(
    userMessage: string
): Promise<{ agent: AgentType; confidence: number } | null> {
    try {
        const userEmbedding = await getEmbedding(userMessage)
        const exampleEmbeddings = await getExampleEmbeddings()

        const scores: Record<AgentType, number> = {
            support: 0,
            order: 0,
            billing: 0
        }

        for (const agentType of ['support', 'order', 'billing'] as AgentType[]) {
            const examples = exampleEmbeddings[agentType]
            const similarities = examples.map((exampleEmbed: number[]) =>
                cosineSimilarity(userEmbedding, exampleEmbed)
            )
            scores[agentType] = Math.max(...similarities)
        }

        const entries = Object.entries(scores) as [AgentType, number][]
        const sorted = entries.sort(([, a], [, b]) => b - a)

        const bestAgent = sorted[0][0]
        const bestScore = sorted[0][1]
        const secondBestScore = sorted[1][1]
        const margin = bestScore - secondBestScore

        if (bestScore > 0.65 && margin > 0.1) {
            return {
                agent: bestAgent,
                confidence: bestScore
            }
        }

        return null
    } catch (error) {
        console.error('Semantic routing error:', error)
        return null
    }
}

export async function initializeSemanticRouter() {
    await getExampleEmbeddings()
}
