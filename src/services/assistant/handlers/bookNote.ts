import type { Ask, AskResponse } from '../utils/types';

export const handleBookNote = async (
  request: Ask<'bookNote'>
): Promise<AskResponse> => {
  return 'None';
};
