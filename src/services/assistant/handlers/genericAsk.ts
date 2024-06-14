import type { Ask, AskResponse } from '../utils/types';

export const handleGenericAsk = async (
  request: Ask<'generic'>
): Promise<AskResponse> => {
  return 'None';
};
