import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface OpenAIChatResponse {
  choices: { message: { content: string } }[];
}

@Injectable()
export class LlmService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  async callLLM(prompt: string, context: any): Promise<string> {
    const messages = [
      { role: 'system', content: context?.systemPrompt || '' },
      { role: 'user', content: prompt },
    ];
    try {
      const response = await axios.post<OpenAIChatResponse>(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 512,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
      return 'Sorry, there was an error contacting the LLM.';
    }
  }
}
