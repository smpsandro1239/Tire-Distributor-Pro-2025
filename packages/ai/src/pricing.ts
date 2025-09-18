import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function calculateOptimalPrice(params: {
  basePrice: number
  competitorPrice?: number
  stockAge: number
  minMargin: number
  demand: number
}) {
  const { basePrice, competitorPrice, stockAge, minMargin, demand } = params

  const prompt = `
    Calculate optimal tire price:
    - Base price: €${basePrice}
    - Competitor price: €${competitorPrice || 'unknown'}
    - Stock age (days): ${stockAge}
    - Minimum margin: ${minMargin}%
    - Demand score (0-1): ${demand}

    Return only the optimal price as a number.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
    })

    const price = parseFloat(response.choices[0]?.message?.content || '0')
    return Math.max(price, basePrice * (1 + minMargin / 100))
  } catch (error) {
    console.error('AI pricing error:', error)
    return basePrice * 1.18 // fallback to 18% margin
  }
}
