import type { Ask, AskResponse } from '../utils/types';

export const handleJournalEntry = async (
  request: Ask<'journalEntry'>
): Promise<AskResponse> => {
  return 'None';
};
