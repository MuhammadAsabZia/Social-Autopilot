import fs from 'fs';
import path from 'path';

// Read .env if exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
}

const BUFFER_GRAPHQL_ENDPOINT = 'https://api.buffer.com';

const mutation = `
mutation CreateIdea {
  createIdea(input: {
    organizationId: "6a85e312dc5683808fdf38c9",
    content: {
      title: "New Idea from GraphQL API"
      text: "This is the text of the new idea created via the GraphQL API."
    }
  }) {
    ... on Idea {
      id
      content {
        title
        text
      }
    }
  }
}
`;

async function main() {
  const cliToken = process.argv[2];
  const apiKey = cliToken || process.env.BUFFER_API_KEY || '';
  console.log('BUFFER_API_KEY present:', Boolean(apiKey));

  const response = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey ? `Bearer ${apiKey}` : '',
      'Accept': 'application/json',
      'User-Agent': 'BufferGraphQLApplet/2.0',
    },
    body: JSON.stringify({ query: mutation }),
  });

  console.log('HTTP Status:', response.status);
  const text = await response.text();
  console.log('Response Body:');
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text);
  }
}

main().catch(console.error);
