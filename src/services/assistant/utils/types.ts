import { z } from 'zod';

export const openAIModelSchema = z
  .enum(['gpt-3.5-turbo-1106', 'gpt-4-1106-preview'])
  .default('gpt-3.5-turbo-1106');
export type OpenAIModel = z.infer<typeof openAIModelSchema>;

export const askSchema = z
  .object({
    model: openAIModelSchema,
    referrer: z.string().optional(),
  })
  .and(
    z.discriminatedUnion('type', [
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
    ])
  );

export type AskType = z.infer<typeof askSchema>['type'];
export type Ask<T extends AskType> = Extract<
  z.infer<typeof askSchema>,
  { type: T }
>;

export type AskResponse = string;

// Should be typed to handle a specific request type
export type AskHandler<T extends AskType> = (
  ask: Ask<T>
) => Promise<AskResponse>;
