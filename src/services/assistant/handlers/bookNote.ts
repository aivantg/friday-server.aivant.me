import type { AssistantRequest, AssistantResponse } from '.';
import type { OpenAIModel } from '../utils/chat';

export const handleBookNote = async (
  request: AssistantRequest<'bookNote'>
): Promise<AssistantResponse> => {
  return 'None';
};
