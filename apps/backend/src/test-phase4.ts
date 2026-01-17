// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\test-phase4.ts
import { agentService } from './services/agentService.js'
import { initializeSemanticRouter } from './utils/semanticRouting.js'
import 'dotenv/config'

const testQueries = [
    "Where is my package?",
    "I need a refund for my recent purchase",
    "How do I reset my password?",
    "Help me cancel my order ORD-2026-001",
    "My payment was declined",
    "Track order number ORD-2026-002",
    "Can you help me with installation steps?",
    "I didn't receive my invoice INV-ORD-2026-001"
]

async function runTests() {
    console.log('Phase 4 Multi-Agent System Test\n')
    console.log('Initializing semantic router...')

    await initializeSemanticRouter()

    console.log('\n' + '='.repeat(100))
    console.log('STARTING TESTS')
    console.log('='.repeat(100) + '\n')

    for (let i = 0; i < testQueries.length; i++) {
        const query = testQueries[i]

        console.log(`\nTEST ${i + 1}/${testQueries.length}`)
        console.log(`Query: "${query}"\n`)

        try {
            const result = await agentService.processMessage(query)

            console.log(`\nROUTING RESULT:`)
            console.log(`  Agent: ${result.routing.agent}`)
            console.log(`  Method: ${result.routing.method}`)
            console.log(`  Confidence: ${result.routing.confidence.toFixed(3)}`)
            if (result.routing.reasoning) {
                console.log(`  Reasoning: ${result.routing.reasoning}`)
            }

            console.log(`\nAGENT RESPONSE:`)
            console.log(`  ${result.response}`)

            console.log(`\n${'-'.repeat(100)}\n`)

            await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
            console.error(`\nTEST FAILED:`, error)
            console.log(`\n${'-'.repeat(100)}\n`)
        }
    }

    console.log('\n' + '='.repeat(100))
    console.log('ALL TESTS COMPLETED')
    console.log('='.repeat(100) + '\n')
}

runTests()
    .then(() => {
        console.log('Test suite completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Test suite failed:', error)
        process.exit(1)
    })
