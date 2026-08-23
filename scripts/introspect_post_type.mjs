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

async function inspectPostType() {
  const query = `
    query IntrospectPostType {
      postType: __type(name: "PostType") {
        name
        enumValues {
          name
          description
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
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  console.log('PostType Enum Values:', JSON.stringify(json, null, 2));
}

inspectPostType().catch(console.error);
