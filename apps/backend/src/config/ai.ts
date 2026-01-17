import { createOpenAI } from '@ai-sdk/openai'
import { HfInference } from '@huggingface/inference'
import 'dotenv/config'

export const llmProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.AI_API_KEY,
})

export const getMainModel = () => {
  const modelName = process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'
  return llmProvider(modelName)
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const result = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
      provider: 'hf-inference',
    })

    if (Array.isArray(result)) {
      if (result.length > 0 && Array.isArray(result[0])) {
        return result[0] as number[]
      }
      return result as number[]
    }

    throw new Error('Unexpected embedding format')
  } catch (error) {
    console.error('Embedding error:', error)
    throw error
  }
}
