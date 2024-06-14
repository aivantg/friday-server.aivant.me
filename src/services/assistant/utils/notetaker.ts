// import { z } from 'zod';
// import {
//   Ask,
//   AssistantIntention,
//   OpenAIModel,
//   chatCompletion,
// } from '../helpers/utils';
// import assertNever from 'assert-never';
// import fetch from 'node-fetch';
// import { Database, Databases, addNoteToRow, getAllRows } from './notionUtils';
// const MAX_ATTEMPTS = 1;

// export const askNotetaker = async (
//   params: Ask,
//   model: OpenAIModel,
//   attempts: number = 0
// ): Promise<string> => {
//   if (attempts === MAX_ATTEMPTS) {
//     throw new Error(
//       `Couldn't get a function call from notetaker — max attempts reached: ${MAX_ATTEMPTS}}`
//     );
//   }

//   const response = await chatCompletion(
//     params.message,
//     model,
//     NOTETAKER_PARAMS.systemPrompt,
//     NOTETAKER_PARAMS.functions,
//     undefined,
//     false
//   );
//   const functionCall = response.choices[0].message.function_call;
//   if (
//     response.choices[0].finish_reason !== 'function_call' ||
//     functionCall === undefined
//   ) {
//     console.error(
//       "Didn't get a function call while calling notetaker, trying again."
//     );
//     console.log(JSON.stringify(response));
//     return await askNotetaker(params, model, attempts + 1);
//   }

//   const parseResult = notetakerResponseSchema.safeParse({
//     name: functionCall.name,
//     arguments: JSON.parse(functionCall.arguments),
//   });
//   if (!parseResult.success) {
//     console.error(
//       `Error parsing function response from notetaker, trying again.`
//     );
//     console.log(JSON.stringify(response.choices[0].message.function_call));
//     console.log(JSON.stringify(parseResult.error));
//     return await askNotetaker(params, model, attempts + 1);
//   }

//   return processNotetakerResponse(parseResult.data, params.message);
// };

// const processNotetakerResponse = async (
//   response: NotetakerResponse,
//   originalMessage: string
// ): Promise<string> => {
//   if (response.name === 'save_journal_entry') {
//     return saveDayOneEntry(
//       `# ${response.arguments.title}\n\n**Summary**: ${response.arguments.summary}\n\n**Transcript**: ${originalMessage}`
//     );
//   } else if (response.name === 'save_conversation_note') {
//     const existingId = await findExistingNotionEntry(
//       Databases.People,
//       JSON.stringify(response.arguments)
//     );
//     return addNoteToRow(existingId, originalMessage);
//   } else if (response.name === 'save_media_note') {
//     const existingId = await findExistingNotionEntry(
//       Databases.Notes,
//       JSON.stringify(response.arguments)
//     );
//     return addNoteToRow(existingId, originalMessage);
//   } else if (response.name === 'save_idea_note') {
//     return saveDayOneEntry(
//       `# Idea: ${response.arguments.title}\n\n**Summary**: ${response.arguments.summary}\n\n**Transcript**: ${originalMessage}`
//     );
//   } else {
//     assertNever(response);
//   }
// };

// const entrySchema = z.object({ matched: z.boolean(), id: z.string() });

// const findExistingNotionEntry = async (
//   database: Database,
//   contextString: string
// ) => {
//   console.log(`Finding notion entry for context string: ${contextString}`);
//   const allRowsObj = await getAllRows(database);
//   const rows = Object.values(allRowsObj);
//   console.log(`Found ${rows.length} rows in database`);
//   const dbString = JSON.stringify(rows, null, 2);

//   const result = await chatCompletion(
//     contextString,
//     'gpt-3.5-turbo-1106',
//     `Given the following context and the following database in JSON with properties: [${Object.keys(
//       rows[0]
//     )}], return a JSON object with two keys: 'matched': boolean, and 'id':string if it's found. If they do not exist, return 'null' as the id.\n\n\`\`\`json\n${dbString}\n\`\`\``,
//     undefined,
//     undefined,
//     true
//   );
//   console.log('Recieved result from notion lookup');
//   console.log(JSON.stringify(result));
//   // TODO: make sure Id is actually in the database
//   try {
//     const resultParsed = entrySchema.parse(
//       JSON.parse(result.choices[0].message.content as string)
//     );
//     if (!resultParsed.matched) {
//       throw new Error('No match found for context: ' + contextString);
//     } else {
//       return resultParsed.id;
//     }
//   } catch (e) {
//     console.log('Error parsing result from notion lookup');
//     console.log(JSON.stringify(result.choices[0].message.content));
//     throw e;
//   }
// };

// const saveDayOneEntry = async (note: string): Promise<string> => {
//   const response = await fetch(
//     'https://maker.ifttt.com/trigger/friday_to_dayone/with/key/13Z80uk8mT-kN-RWMAOPl',
//     {
//       method: 'post',
//       body: JSON.stringify({ value1: note }),
//       headers: { 'Content-Type': 'application/json' },
//     }
//   );
//   const data = await response.text();
//   console.log('Saved day one entry and recieved following response');
//   console.log(data);
//   return data;
// };

// const NOTETAKER_PARAMS = {
//   systemPrompt: `You receive transcriptions of voice messages that I recorded to take notes on something I experienced. Pick the function most relevant to the type of note. Always call a function, if none seem to apply, use 'save_journal_entry.'`,
//   functions: [
//     {
//       name: 'save_media_note',
//       description:
//         'Save a note about a piece of media, such as a book, essay, movie, lecture, or article.',
//       parameters: {
//         type: 'object',
//         properties: {
//           summary: {
//             type: 'string',
//             description:
//               'A summary of the note written from my first-person perspective in about 100 words. Capture as much detail as possible, be concise, and be faithful to the source message.',
//           },
//           title: {
//             type: 'string',
//             description:
//               'Name of media (essay, book, or movie title) or short 1-sentence summary of media if not found',
//           },
//           seriesTitle: {
//             type: 'string',
//             description:
//               'Name of larger series that media is part of (e.g. book that essay is in, conference that lecture is part of, etc)',
//           },
//           mediaType: {
//             type: 'string',
//             enum: [
//               'book',
//               'essay',
//               'article',
//               'lecture',
//               'video',
//               'event',
//               'game',
//               'speech',
//               'other',
//             ],
//           },
//           otherMediaType: {
//             type: 'string',
//             description:
//               "If media type is 'other', provide 1-2 word description of media type.",
//           },
//           author: {
//             type: 'string',
//           },
//         },
//         required: ['title', 'mediaType', 'summary'],
//       },
//     },
//     {
//       name: 'save_conversation_note',
//       description:
//         'Save a note about a conversation with someone that I want to remember later.',
//       parameters: {
//         type: 'object',
//         properties: {
//           summary: {
//             type: 'string',
//             description:
//               'A summary of the note written from my first-person perspective in about 100 words. Capture as much detail as possible, be concise, and be faithful to the source message.',
//           },
//           personName: {
//             type: 'string',
//             description: 'Name of person I was talking to',
//           },
//           meetupContext: {
//             type: 'string',
//             description:
//               'Details on where, why, and how did I found myself in this conversation?',
//           },
//           keyEvents: {
//             type: 'array',
//             description:
//               'Array of strings with key details worth remembering from the conversation',
//             items: {
//               type: 'string',
//             },
//           },
//         },
//         required: ['personName', 'keyEvents', 'meetupContext', 'summary'],
//       },
//     },
//     {
//       name: 'save_idea_note',
//       description: 'Save a note describing an idea I want to remember later.',
//       parameters: {
//         type: 'object',
//         properties: {
//           summary: {
//             type: 'string',
//             description:
//               'A summary of the idea written from my first-person perspective in about 100 words. Capture as much detail as possible, be concise, and be faithful to the source message.',
//           },
//           title: {
//             type: 'string',
//             description: 'Short, 1-sentence title summarizing idea',
//           },
//           ideaType: {
//             type: 'string',
//             enum: ['project', 'gathering', 'other'],
//           },
//           otherIdeaType: {
//             type: 'string',
//             description:
//               'If ideaType is other, provide a 1-2 word description of the idea type',
//           },
//         },
//         required: ['title', 'ideaType', 'summary'],
//       },
//     },
//     {
//       name: 'save_journal_entry',
//       description: "Save a journal entry where I'm reflecting on something.",
//       parameters: {
//         type: 'object',
//         properties: {
//           summary: {
//             type: 'string',
//             description:
//               'A summary of the note written from my first-person perspective in about 100 words. Capture as much detail as possible, be concise, and be faithful to the source message.',
//           },
//           title: {
//             type: 'string',
//             description: 'Short, 1-sentence title summarizing journal entry',
//           },
//         },
//         required: ['title', 'summary'],
//       },
//     },
//   ],
// };

// const notetakerResponseSchema = z.discriminatedUnion('name', [
//   z.object({
//     name: z.literal('save_media_note'),
//     arguments: z.object({
//       summary: z.string(),
//       title: z.string(),
//       seriesTitle: z.string().optional(),
//       mediaType: z.enum([
//         'book',
//         'essay',
//         'article',
//         'lecture',
//         'video',
//         'event',
//         'game',
//         'other',
//       ]),
//       otherMediaType: z.string().optional(),
//       author: z.string().optional(),
//     }),
//   }),
//   z.object({
//     name: z.literal('save_conversation_note'),
//     arguments: z.object({
//       summary: z.string(),
//       personName: z.string(),
//       meetupContext: z.string(),
//       keyEvents: z.array(z.string()),
//     }),
//   }),

//   z.object({
//     name: z.literal('save_idea_note'),
//     arguments: z.object({
//       summary: z.string(),
//       title: z.string(),
//       ideaType: z.enum(['project', 'gathering', 'other']),
//       otherIdeaType: z.string().optional(),
//     }),
//   }),

//   z.object({
//     name: z.literal('save_journal_entry'),
//     arguments: z.object({
//       summary: z.string(),
//       title: z.string(),
//     }),
//   }),
// ]);

// type NotetakerResponse = z.infer<typeof notetakerResponseSchema>;
