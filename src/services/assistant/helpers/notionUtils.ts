import { Client, collectPaginatedAPI } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { camelCase } from 'lodash';
import moment from 'moment-timezone';
import { z } from 'zod';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const titleSchema = z
  .object({
    title: z.array(z.object({ plain_text: z.string() })),
  })
  .transform((v) => v.title[0].plain_text);
const plainTextSchema = z
  .object({ plain_text: z.string() })
  .transform((v) => v.plain_text);
const multiSelectSchema = z
  .object({
    multi_select: z.array(z.object({ name: z.string() })),
  })
  .transform((v) => v.multi_select.map((t) => t.name));
const richTextSchema = z
  .object({
    rich_text: z.array(z.object({ plain_text: z.string() })),
  })
  .transform((v) => v.rich_text.map((t) => t.plain_text).join(' '));

export type Database = { id: string; rowSchema: z.ZodObject<any, any> };
export const Databases = {
  People: {
    id: 'd2fcdbdeb38d4c4a896736802ece99fc',
    rowSchema: z.object({
      name: titleSchema.optional(),
      notes: richTextSchema.optional(),
      location: multiSelectSchema.optional(),
      tags: multiSelectSchema.optional(),
    }),
  },
  Notes: {
    id: 'fdbf4bce219f499bbe65fa41db2b992b',
    rowSchema: z.object({
      name: titleSchema.optional(),
      contentType: multiSelectSchema.optional(),
      author: richTextSchema.optional(),
    }),
  },
} as const;

const cleanId = (id: string) => id.split('-').join('');
const urlForId = (id: string, blockId?: string) =>
  `https://notion.so/${cleanId(id)}#${blockId ? cleanId(blockId) : ''}`;

export async function getAllRows(
  database: Database
): Promise<Record<string, any>> {
  const rows = await collectPaginatedAPI(notion.databases.query, {
    database_id: database.id,
  });
  try {
    return Object.fromEntries(
      rows.map((row) => [
        row.id,
        {
          id: row.id,
          url: urlForId(row.id),
          properties: database.rowSchema.parse(
            (row as PageObjectResponse).properties
          ),
        },
      ])
    );
  } catch (e) {
    console.log('Error getting context rows in database');
    console.log(JSON.stringify(e));
    throw e;
  }
}

// Append bulleted list item block to page with given id
export async function addNoteToRow(
  rowId: string,
  note: string
): Promise<string> {
  const newBlock: any = await notion.blocks.children.append({
    block_id: rowId,
    children: [
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              text: { content: note },
            },
            {
              type: 'text',
              text: {
                content: ` (note added via Friday on ${moment()
                  .tz('America/Los_Angeles')
                  .format('MMMM Do YYYY, h:mm a')} PST)`,
              },
              annotations: {
                italic: true,
              },
            },
          ],
        },
      },
    ],
  });
  return urlForId(rowId, newBlock.results[0].id);
}

// const personToCreatePageParams = (
//   person: CreatePersonParams
// ): CreatePageParameters => ({
//   parent: {
//     type: 'database_id',
//     database_id: PEOPLE_DATABASE,
//   },
//   properties: {
//     Name: {
//       title: [
//         {
//           text: {
//             content: person.name,
//           },
//         },
//       ],
//     },
//     Notes: person.notes
//       ? {
//           rich_text: [
//             {
//               text: {
//                 content: person.notes,
//               },
//             },
//           ],
//         }
//       : undefined,
//     Location: person.location
//       ? {
//           multi_select: person.location.split(',').map((s) => {
//             return { name: s.trim() };
//           }),
//         }
//       : undefined,
//     Tags: person.tags
//       ? {
//           multi_select: person.tags.split(',').map((s) => {
//             return { name: s.trim() };
//           }),
//         }
//       : undefined,
//   },
// });

// export async function addNewPerson(
//   notion: Client,
//   person: CreatePersonParams
// ): Promise<Person> {
//   const result = (await notion.pages.create(
//     personToCreatePageParams(person)
//   )) as PageObjectResponse;
//   return personRowToPerson(result as any as PersonRow);
// }
