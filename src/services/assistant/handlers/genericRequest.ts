import type { AssistantRequest, AssistantResponse } from '.';
import type { OpenAIModel } from '../utils/chat';

export const handleGenericRequest = async (
  request: AssistantRequest<'generic'>
): Promise<AssistantResponse> => {
  return 'None';
};
