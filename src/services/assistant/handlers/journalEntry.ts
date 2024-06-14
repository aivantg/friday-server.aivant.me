import type { Ask, AskResponse } from '../utils/types';

export const handleJournalEntry = async (
  ask: Ask<'journalEntry'>
): Promise<AskResponse> => {
  return saveDayOneEntry(ask.entry);
};

const saveDayOneEntry = async (note: string): Promise<string> => {
  const response = await fetch(
    'https://maker.ifttt.com/trigger/friday_to_dayone/with/key/13Z80uk8mT-kN-RWMAOPl',
    {
      method: 'post',
      body: JSON.stringify({ value1: note }),
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await response.text();
  console.log('Saved day one entry and recieved following response');
  console.log(data);
  return data;
};

/*
{
      name: 'save_journal_entry',
      description: "Save a journal entry where I'm reflecting on something.",
      parameters: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description:
              'A summary of the note written from my first-person perspective in about 100 words. Capture as much detail as possible, be concise, and be faithful to the source message.',
          },
          title: {
            type: 'string',
            description: 'Short, 1-sentence title summarizing journal entry',
          },
        },
        required: ['title', 'summary'],
      },
    },
    */
