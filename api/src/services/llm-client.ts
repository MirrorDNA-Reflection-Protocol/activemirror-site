import OpenAI from 'openai'
import type { ModelConfig } from '../types/index.js'

const clients: Record<string, OpenAI> = {}

function getClient(provider: string): OpenAI {
  if (clients[provider]) return clients[provider]

  const configs: Record<string, { apiKey: string | undefined; baseURL: string }> = {
    Groq: {
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    },
    DeepSeek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1'
    },
    Mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: 'https://api.mistral.ai/v1'
    }
  }

  const config = configs[provider]
  if (!config) throw new Error(`Unknown provider: ${provider}`)

  clients[provider] = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  })

  return clients[provider]
}

const SYSTEM_PROMPT = `You are Active Mirror, a sovereign AI reflection engine. You provide thoughtful, clear, and helpful responses.

Guidelines:
- Be concise but thorough
- Use markdown formatting when helpful
- If you don't know something, say so
- Never pretend to have capabilities you don't have`

export async function* streamChat(
  model: ModelConfig,
  message: string,
  imageBase64?: string
): AsyncGenerator<string> {
  const client = getClient(model.provider)

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT }
  ]

  // Handle vision model with image
  if (model.tier === 'vision' && imageBase64) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message || 'What do you see in this image?' },
        { type: 'image_url', image_url: { url: imageBase64 } }
      ]
    })
  } else {
    messages.push({ role: 'user', content: message })
  }

  const stream = await client.chat.completions.create({
    model: model.modelId,
    messages,
    max_tokens: model.maxTokens,
    temperature: model.temperature,
    stream: true
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}

export async function chatComplete(
  model: ModelConfig,
  message: string
): Promise<string> {
  const client = getClient(model.provider)

  const response = await client.chat.completions.create({
    model: model.modelId,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message }
    ],
    max_tokens: model.maxTokens,
    temperature: model.temperature
  })

  return response.choices[0]?.message?.content || ''
}
