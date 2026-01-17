// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\test-phase4-with-output.ts
import { agentService } from './services/agentService.js'
import { initializeSemanticRouter } from './utils/semanticRouting.js'
import { writeFileSync } from 'fs'
import { join } from 'path'
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

let outputLog = ''

function log(message: string) {
  console.log(message)
  outputLog += message + '\n'
}

async function runTests() {
  const startTime = new Date()
  
  log('================================================================================')
  log('PHASE 4 MULTI-AGENT SYSTEM TEST RESULTS')
  log('================================================================================')
  log(`Test Date: ${startTime.toLocaleString()}`)
  log(`Total Test Cases: ${testQueries.length}`)
  log('================================================================================\n')
  
  log('Initializing semantic router...')
  await initializeSemanticRouter()
  log('Semantic router initialized successfully\n')
  
  log('================================================================================')
  log('TEST EXECUTION')
  log('================================================================================\n')

  const results = []

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i]
    
    log(`\n${'='.repeat(80)}`)
    log(`TEST ${i + 1}/${testQueries.length}`)
    log(`${'='.repeat(80)}`)
    log(`Query: "${query}"`)
    log('')

    const testStart = Date.now()
    let testResult = {
      testNumber: i + 1,
      query: query,
      agent: '',
      method: '',
      confidence: 0,
      reasoning: '',
      response: '',
      executionTime: 0,
      status: 'PASS'
    }

    try {
      const result = await agentService.processMessage(query)
      const testEnd = Date.now()
      
      testResult = {
        testNumber: i + 1,
        query: query,
        agent: result.routing.agent,
        method: result.routing.method,
        confidence: result.routing.confidence,
        reasoning: result.routing.reasoning || '',
        response: result.response,
        executionTime: testEnd - testStart,
        status: 'PASS'
      }
      
      log('ROUTING RESULT:')
      log(`  Agent Selected: ${result.routing.agent.toUpperCase()}`)
      log(`  Routing Method: ${result.routing.method}`)
      log(`  Confidence Score: ${result.routing.confidence.toFixed(3)}`)
      if (result.routing.reasoning) {
        log(`  Reasoning: ${result.routing.reasoning}`)
      }
      log('')
      
      log('AGENT RESPONSE:')
      log(`  ${result.response}`)
      log('')
      
      log(`Execution Time: ${testResult.executionTime}ms`)
      log(`Status: PASS`)
      
    } catch (error: any) {
      const testEnd = Date.now()
      testResult.executionTime = testEnd - testStart
      testResult.status = 'FAIL'
      testResult.response = `Error: ${error.message}`
      
      log('TEST FAILED')
      log(`Error: ${error.message}`)
      log(`Execution Time: ${testResult.executionTime}ms`)
      log(`Status: FAIL`)
    }

    results.push(testResult)
    log(`${'-'.repeat(80)}\n`)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const endTime = new Date()
  const totalTime = endTime.getTime() - startTime.getTime()
  
  log('\n' + '='.repeat(80))
  log('TEST SUMMARY')
  log('='.repeat(80))
  
  const passCount = results.filter(r => r.status === 'PASS').length
  const failCount = results.filter(r => r.status === 'FAIL').length
  
  log(`Total Tests: ${results.length}`)
  log(`Passed: ${passCount}`)
  log(`Failed: ${failCount}`)
  log(`Success Rate: ${((passCount / results.length) * 100).toFixed(1)}%`)
  log(`Total Execution Time: ${(totalTime / 1000).toFixed(2)}s`)
  log('='.repeat(80) + '\n')
  
  log('DETAILED BREAKDOWN BY AGENT:')
  log('-'.repeat(80))
  
  const agentStats = {
    support: results.filter(r => r.agent === 'support'),
    order: results.filter(r => r.agent === 'order'),
    billing: results.filter(r => r.agent === 'billing')
  }
  
  for (const [agent, tests] of Object.entries(agentStats)) {
    if (tests.length > 0) {
      const passed = tests.filter(t => t.status === 'PASS').length
      log(`\n${agent.toUpperCase()} Agent:`)
      log(`  Total Queries: ${tests.length}`)
      log(`  Success: ${passed}/${tests.length}`)
      log(`  Average Confidence: ${(tests.reduce((sum, t) => sum + t.confidence, 0) / tests.length).toFixed(3)}`)
    }
  }
  
  log('\n' + '-'.repeat(80))
  log('\nROUTING METHOD BREAKDOWN:')
  log('-'.repeat(80))
  
  const semanticCount = results.filter(r => r.method === 'semantic').length
  const llmCount = results.filter(r => r.method === 'llm').length
  
  log(`Semantic Routing: ${semanticCount} queries (${((semanticCount / results.length) * 100).toFixed(1)}%)`)
  log(`LLM Routing: ${llmCount} queries (${((llmCount / results.length) * 100).toFixed(1)}%)`)
  
  log('\n' + '='.repeat(80))
  log('END OF TEST REPORT')
  log('='.repeat(80))

  const outputPath = join(process.cwd(), 'test-results.txt')
  writeFileSync(outputPath, outputLog, 'utf-8')
  
  console.log(`\nTest results saved to: ${outputPath}`)
  
  return results
}

runTests()
  .then(() => {
    console.log('\nTest suite completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nTest suite failed:', error)
    process.exit(1)
  })
