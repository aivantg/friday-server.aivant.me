import { Client, collectPaginatedAPI } from '@notionhq/client';
import {
  CreatePageParameters,
  PageObjectResponse,
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
  url: string;
};

type CreatePersonParams = Omit<Person, 'id' | 'url'>;

type PersonRow = {
  id: string;
  properties: {
    Name: { title: { plain_text: string } };
    Notes?: { rich_text: [{ plain_text: string }] };
    Location?: { multi_select: [{ name: string }] };
    Tags?: { multi_select: [{ name: string }] };
  };
};

const personRowToPerson = (personRow: PersonRow): Person => ({
  id: personRow.id,
  name: personRow.properties.Name.title[0]?.plain_text ?? '',
  notes:
    personRow.properties.Notes?.rich_text.map((t) => t.plain_text).join(' ') ??
    '',
  location:
    personRow.properties.Location?.multi_select.map((s) => s.name).join(', ') ??
    '',
  tags:
    personRow.properties.Tags?.multi_select.map((s) => s.name).join(',') ?? '',
  url: `${BASE_URL}/${personRow.id.split('-').join('')}`,
});

const personToCreatePageParams = (
  person: CreatePersonParams
): CreatePageParameters => ({
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
});

export async function getPeople(
  notion: Client,
  searchString?: string
): Promise<Record<string, Person>> {
  const personRows: PersonRow[] = (await collectPaginatedAPI(
    notion.databases.query,
    {
      database_id: PEOPLE_DATABASE,
      filter: searchString
        ? {
            property: 'Name',
            rich_text: {
              contains: searchString,
            },
          }
        : undefined,
    }
  )) as any as PersonRow[];

  return Object.fromEntries(
    personRows.map(personRowToPerson).map((p) => [p.id, p])
  );
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
  return `${BASE_URL}/${personId.split('-').join('')}#${resultId}`;
}

export async function addNewPerson(
  notion: Client,
  person: CreatePersonParams
): Promise<Person> {
  const result = (await notion.pages.create(
    personToCreatePageParams(person)
  )) as PageObjectResponse;
  return personRowToPerson(result as any as PersonRow);
}
