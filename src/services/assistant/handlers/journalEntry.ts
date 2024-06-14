import type { AssistantRequest, AssistantResponse } from '.';
import type { OpenAIModel } from '../utils/chat';

export const handleJournalEntry = async (
  request: AssistantRequest<'journalEntry'>
): Promise<AssistantResponse> => {
  return 'None';
};
