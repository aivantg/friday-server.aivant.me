import { z } from 'zod';
import { handleBookNote } from './bookNote';
import { handleConversationNote } from './conversationNote';
import { handleGenericAsk } from './genericAsk';
import { handleJournalEntry } from './journalEntry';
import type { Ask, AskHandler, AskType } from '../utils/types';

const AskHandlers: {
  [K in AskType]: AskHandler<K>;
} = {
  generic: handleGenericAsk,
  journalEntry: handleJournalEntry,
  bookNote: handleBookNote,
  conversationNote: handleConversationNote,
};

export const handleRequest = async <T extends AskType>(
  ask: Ask<T>
): Promise<string> => {
  const { referrer, model } = ask;
  console.log(`Received ask from referrer: '${referrer}' using ${model}`);
  console.log(`Full Ask: '${JSON.stringify(ask, null, 2)}'`);
  return AskHandlers[ask.type](ask);
};
