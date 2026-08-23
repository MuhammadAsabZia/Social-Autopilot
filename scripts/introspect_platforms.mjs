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

async function inspectPlatformInputs() {
  const query = `
    query IntrospectPlatforms {
      instagramPostMetadata: __type(name: "InstagramPostMetadataInput") {
        name
        inputFields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
      facebookPostMetadata: __type(name: "FacebookPostMetadataInput") {
        name
        inputFields {
          name
          type {
            name
            kind
          }
        }
      }
      imageAsset: __type(name: "ImageAssetInput") {
        name
        inputFields {
          name
          type {
            name
            kind
          }
        }
      }
      instagramTypeEnum: __type(name: "InstagramPostType") {
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
  console.log('Platform Metadata Details:', JSON.stringify(json, null, 2));
}

inspectPlatformInputs().catch(console.error);
