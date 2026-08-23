import fs from 'fs';
import path from 'path';

// Read .env
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
const apiKey = process.env.BUFFER_API_KEY || '';

async function run() {
  const orgsQuery = `
    query GetOrganizations {
      account {
        id
        organizations {
          id
          name
          ownerEmail
        }
      }
    }
  `;

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query: orgsQuery }),
  });

  const json = await res.json();
  console.log('Organizations:', JSON.stringify(json, null, 2));

  const orgs = json.data?.account?.organizations || [];
  for (const org of orgs) {
    const chanQuery = `
      query GetChannels($input: ChannelsInput!) {
        channels(input: $input) {
          id
          name
          service
        }
      }
    `;
    const cRes = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: chanQuery, variables: { input: { organizationId: org.id } } }),
    });
    const cJson = await cRes.json();
    console.log(`Channels for org ${org.name} (${org.id}):`, JSON.stringify(cJson, null, 2));
  }
}

run().catch(console.error);
