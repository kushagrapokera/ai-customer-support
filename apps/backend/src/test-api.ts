// C:\Users\kusha\OneDrive\Desktop\Projects\Swades Ai\apps\backend\src\test-api.ts
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import 'dotenv/config'

console.log('API Configuration Test\n')
console.log('='.repeat(80))
console.log('API Key:', process.env.AI_API_KEY?.substring(0, 20) + '...')
console.log('API Base URL:', process.env.AI_BASE_URL)
console.log('Model:', process.env.AI_MODEL)
console.log('='.repeat(80) + '\n')

const provider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY,
})

const model = provider(process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free')

async function testBasicGeneration() {
  console.log('Test 1: Basic Text Generation (No Tools)')
  console.log('-'.repeat(80))
  
  try {
    const { text } = await generateText({
      model: model,
      prompt: 'Say hello in one sentence.',
    })
    
    console.log('SUCCESS: Basic generation works')
    console.log('Response:', text)
    console.log()
    return true
  } catch (error: any) {
    console.log('FAILED: Basic generation failed')
    console.log('Error:', error.message)
    if (error.statusCode) {
      console.log('Status Code:', error.statusCode)
    }
    if (error.responseBody) {
      console.log('Response Body:', error.responseBody)
    }
    console.log()
    return false
  }
}

async function testToolCalling() {
  console.log('Test 2: Tool Calling Support')
  console.log('-'.repeat(80))
  
  const testTool = {
    getWeather: {
      description: 'Get the weather for a location',
      parameters: z.object({
        location: z.string().describe('The city name'),
      }),
      execute: async ({ location }: { location: string }) => {
        return { location, temperature: 72, condition: 'sunny' }
      },
    }
  }
  
  try {
    const { text } = await generateText({
      model: model,
      prompt: 'What is the weather in New York?',
      tools: testTool,
      maxSteps: 2,
    })
    
    console.log('SUCCESS: Tool calling works')
    console.log('Response:', text)
    console.log()
    return true
  } catch (error: any) {
    console.log('FAILED: Tool calling not supported')
    console.log('Error:', error.message)
    if (error.statusCode) {
      console.log('Status Code:', error.statusCode)
    }
    if (error.responseBody) {
      console.log('Response Body:', error.responseBody)
    }
    console.log()
    return false
  }
}

async function testJSONMode() {
  console.log('Test 3: JSON Response')
  console.log('-'.repeat(80))
  
  try {
    const { text } = await generateText({
      model: model,
      prompt: 'Classify this as positive or negative: "I love this product". Respond in JSON format: {"sentiment": "positive" or "negative"}',
    })
    
    console.log('SUCCESS: JSON generation works')
    console.log('Response:', text)
    console.log()
    return true
  } catch (error: any) {
    console.log('FAILED: JSON generation failed')
    console.log('Error:', error.message)
    console.log()
    return false
  }
}

async function runTests() {
  console.log('Starting API Tests...\n')
  
  const results = {
    basicGeneration: await testBasicGeneration(),
    toolCalling: await testToolCalling(),
    jsonMode: await testJSONMode(),
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('TEST SUMMARY')
  console.log('='.repeat(80))
  console.log('Basic Generation:', results.basicGeneration ? 'PASS' : 'FAIL')
  console.log('Tool Calling:', results.toolCalling ? 'PASS' : 'FAIL')
  console.log('JSON Mode:', results.jsonMode ? 'PASS' : 'FAIL')
  console.log('='.repeat(80))
  
  if (!results.basicGeneration) {
    console.log('\nRECOMMENDATION: Check your API key and base URL')
  } else if (!results.toolCalling) {
    console.log('\nRECOMMENDATION: This model/provider does not support tool calling.')
    console.log('Switch to one of these providers:')
    console.log('1. Together AI - https://api.together.xyz (supports tools, $5 free credit)')
    console.log('2. OpenAI - https://platform.openai.com (supports tools, paid)')
    console.log('3. Groq - https://groq.com (supports tools, free tier)')
  } else {
    console.log('\nALL TESTS PASSED: Your API configuration is working correctly!')
  }
  
  console.log()
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test suite crashed:', error)
    process.exit(1)
  })
