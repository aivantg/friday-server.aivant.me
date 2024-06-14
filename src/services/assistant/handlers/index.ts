import { z } from 'zod';
import { handleBookNote } from './bookNote';
import { handleConversationNote } from './conversationNote';
import { handleGenericRequest } from './genericRequest';
import { handleJournalEntry } from './journalEntry';
import type {
  AssistantRequest,
  AssistantRequestHandler,
  AssistantRequestType,
} from '../utils/types';

const AssistantRequestHandlers: {
  [K in AssistantRequestType]: AssistantRequestHandler<K>;
} = {
  generic: handleGenericRequest,
  journalEntry: handleJournalEntry,
  bookNote: handleBookNote,
  conversationNote: handleConversationNote,
};

export const handleRequest = async <T extends AssistantRequestType>(
  req: AssistantRequest<T>
): Promise<string> => {
  const { source, model, ask } = req;
  console.log(
    `Received assistant request from source: '${source}' using ${model}`
  );
  console.log(`Ask: '${JSON.stringify(ask, null, 2)}'`);
  return AssistantRequestHandlers[ask.type](req);
};
