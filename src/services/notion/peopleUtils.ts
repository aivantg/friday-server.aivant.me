import { Client, collectPaginatedAPI } from '@notionhq/client';
import {
  AppendBlockChildrenResponse,
  CreatePageResponse,
  PageObjectResponse,
  search,
} from '@notionhq/client/build/src/api-endpoints';

// Mapping of database type to notion database id.
// This info isn't secret as nothing can be done with it if the database isn't public.
const PEOPLE_DATABASE = 'a41b62454dba47f09b18cc3f6543938f';
const BASE_URL = 'https://www.notion.so';

export type Person = {
  id: string;
  name: string;
  notes: string;
  location: string;
  tags: string;
};

type PersonRow = {
  id: string;
  properties: {
    Name: { title: { plain_text: string } };
    Notes?: { rich_text: [{ plain_text: string }] };
    Location?: { multi_select: [{ name: string }] };
    Tags?: { multi_select: [{ name: string }] };
  };
};

export async function findPersonIdByName(
  notion: Client,
  nameToSearch: string
): Promise<string | undefined> {
  const searchResults: PersonRow[] = (await collectPaginatedAPI(
    notion.databases.query,
    {
      database_id: PEOPLE_DATABASE,
      filter: {
        property: 'Name',
        rich_text: {
          contains: nameToSearch,
        },
      },
    }
  )) as unknown as PersonRow[];

  return searchResults[0]?.id;
}

// Append bulleted list item block to page with id: `personId`
export async function addNoteToPerson(
  notion: Client,
  personId: string,
  note: string
): Promise<string> {
  const newBlock: any = await notion.blocks.children.append({
    block_id: personId,
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
          ],
        },
      },
    ],
  });
  const resultId = newBlock.results[0].id.split('-').join('');
  console.log(resultId);
  return `${BASE_URL}/${personId.split('-').join('')}#${resultId}`;
}

export async function addNewPerson(notion: Client, person: Omit<Person, 'id'>) {
  const result = (await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: PEOPLE_DATABASE,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: person.name,
            },
          },
        ],
      },
      Notes: person.notes
        ? {
            rich_text: [
              {
                text: {
                  content: person.notes,
                },
              },
            ],
          }
        : undefined,
      Location: person.location
        ? {
            multi_select: person.location.split(',').map((s) => {
              return { name: s.trim() };
            }),
          }
        : undefined,
      Tags: person.tags
        ? {
            multi_select: person.tags.split(',').map((s) => {
              return { name: s.trim() };
            }),
          }
        : undefined,
    },
  })) as PageObjectResponse;
  return result.url;
}

export async function getAllPeople(notion: Client): Promise<Person[]> {
  const allPersonRows: PersonRow[] = (await collectPaginatedAPI(
    notion.databases.query,
    {
      database_id: PEOPLE_DATABASE,
    }
  )) as unknown as PersonRow[];

  return allPersonRows.map((personRow) => {
    // Assume people table returns responses in expected format.
    return {
      id: personRow.id,
      name: personRow.properties.Name.title[0].plain_text,
      notes:
        personRow.properties.Notes?.rich_text
          .map((t) => t.plain_text)
          .join(' ') ?? '',
      location: personRow.properties.Location?.multi_select
        .map((s) => s.name)
        .join(', '),
      tags: personRow.properties.Tags?.multi_select
        .map((s) => s.name)
        .join(','),
    };
  });
}
