import { z } from 'zod';

export const openAIModelSchema = z
  .enum(['gpt-3.5-turbo-1106', 'gpt-4-1106-preview'])
  .default('gpt-3.5-turbo-1106');
export type OpenAIModel = z.infer<typeof openAIModelSchema>;

export const assistantRequestSchema = z.object({
  model: openAIModelSchema,
  source: z.string().optional(),
  ask: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('generic'),
      message: z.string(),
    }),
    z.object({
      type: z.literal('journalEntry'),
      entry: z.string(),
    }),
    z.object({
      type: z.literal('bookNote'),
      bookInfo: z.string(),
      note: z.string(),
    }),
    z.object({
      type: z.literal('conversationNote'),
      personInfo: z.string(),
      note: z.string(),
    }),
  ]),
});

export type AssistantRequestType = z.infer<
  typeof assistantRequestSchema
>['ask']['type'];
export type AssistantRequest<T extends AssistantRequestType> = Extract<
  z.infer<typeof assistantRequestSchema>,
  { ask: { type: T } }
>;

export type AssistantResponse = string;

// Should be typed to handle a specific request type
export type AssistantRequestHandler<T extends AssistantRequestType> = (
  request: AssistantRequest<T>
) => Promise<AssistantResponse>;
