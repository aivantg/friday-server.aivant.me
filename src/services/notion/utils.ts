import { Client } from '@notionhq/client';

// Mapping of database type to notion database id.
// This info isn't secret as nothing can be done with it if the database isn't public.
const DATABASES = {
  people: { id: 'a41b62454dba47f09b18cc3f6543938f' },
};

export type Person = {
  id: string;
  name: string;
  notes: string;
  location: string;
};

type PersonRow = {
  id: string;
  properties: {
    Name: { title: { plain_text: string } };
    Notes?: { rich_text: [{ plain_text: string }] };
    Location: { multi_select: [{ name: string }] };
  };
};

export async function getAllPeople(notion: Client): Promise<Person[]> {
  const response = await notion.databases.query({
    database_id: DATABASES.people.id,
  });

  if (!response.results) {
    throw new Error('Notion API returned no results.');
  }
  return response.results.map((r: unknown) => {
    // Assume people table returns responses in expected format.
    const personRow = r as PersonRow;
    return {
      id: personRow.id,
      name: personRow.properties.Name.title[0].plain_text,
      notes:
        personRow.properties.Notes?.rich_text
          .map((t) => t.plain_text)
          .join(' ') ?? '',
      location: personRow.properties.Location.multi_select
        .map((s) => s.name)
        .join(', '),
    };
  });
}
