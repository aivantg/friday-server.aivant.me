import assertNever from 'assert-never';
import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionCreateParams } from 'openai/resources';
import { z } from 'zod';
import { askNotetaker } from './notetaker';

export type OpenAIModel = 'gpt-3.5-turbo-1106' | 'gpt-4-1106-preview';
const openai = new OpenAI();

export type ChatCompletionParams = {};

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

export const assistantRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('notetaker'),
    message: z.string(),
  }),
]);

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

type AssistantRequestHandler = (
  request: AssistantRequest,
  model: OpenAIModel
) => Promise<string>;

const AssistantRequestHandlers: Record<
  AssistantRequest['type'],
  AssistantRequestHandler
> = {
  notetaker: askNotetaker,
};

export const askAssistant = async (
  request: AssistantRequest,
  model: OpenAIModel = 'gpt-3.5-turbo-1106'
): Promise<string> => {
  return AssistantRequestHandlers[request.type](request, model);
};

export const assistantIntentionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('saveMediaNote'),
  }),
  z.object({
    type: z.literal('saveIdea'),
  }),
  z.object({
    type: z.literal('saveJournalEntry'),
  }),
  z.object({
    type: z.literal('saveConversationNote'),
  }),
]);

export type AssistantIntention = z.infer<typeof assistantIntentionSchema>;
