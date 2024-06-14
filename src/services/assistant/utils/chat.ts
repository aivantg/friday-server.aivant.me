import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
} from 'openai/resources';
import type { OpenAIModel } from './types';

const openai = new OpenAI();

export const chatCompletion = async (
  message: string,
  model: OpenAIModel,
  systemPrompt: string,
  functions: ChatCompletionCreateParams.Function[] | undefined,
  functionToCall: string | undefined,
  shouldReturnJSON: boolean
): Promise<ChatCompletion> => {
  return await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    model,
    response_format: shouldReturnJSON ? { type: 'json_object' } : undefined,
    functions,
    function_call: functionToCall ? { name: functionToCall } : undefined,
  });
};
