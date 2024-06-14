import type { AssistantRequest, AssistantResponse } from '.';
import type { OpenAIModel } from '../utils/chat';

export const handleConversationNote = async (
  request: AssistantRequest<'conversationNote'>
): Promise<AssistantResponse> => {
  return 'None';
};
