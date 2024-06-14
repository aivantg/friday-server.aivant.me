import type { Ask, AskResponse } from '../utils/types';

export const handleGenericAsk = async (
  ask: Ask<'generic'>
): Promise<AskResponse> => {
  throw new Error('Not implemented');
};
