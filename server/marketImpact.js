import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MARKET_IMPACT_PROMPT = `
Analyze the following news message and:
1. Determine its potential impact on financial markets (score 0-100)
2. Categorize it (geopolitical, economic, technology, environmental, other)
3. Explain the reasoning

Format the response as JSON:
{
  "score": number,
  "category": string,
  "reasoning": string
}
`;

export async function calculateMarketImpact(text) {
  if (!text) {
    return {
      score: 0,
      category: 'other',
      reasoning: 'No text provided for analysis'
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: MARKET_IMPACT_PROMPT },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: result.score,
      category: result.category.toLowerCase(),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('Error calculating market impact:', error);
    return {
      score: 50,
      category: 'other',
      reasoning: 'Error analyzing message'
    };
  }
}