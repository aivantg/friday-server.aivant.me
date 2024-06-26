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

export const handleAsk = async <T extends AskType>(
  ask: Ask<T>
): Promise<string> => {
  const { referrer, model } = ask;
  console.log(`Received ask from referrer: '${referrer}' using ${model}`);
  console.log(`Full Ask: '${JSON.stringify(ask, null, 2)}'`);
  const handler: AskHandler<T> = AskHandlers[ask.type] as AskHandler<T>;
  return handler(ask);
};
