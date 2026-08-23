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

async function inspectTypes() {
  const query = `
    query IntrospectDetails {
      metaType: __type(name: "PostInputMetaData") {
        name
        inputFields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
      assetType: __type(name: "AssetInput") {
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
      instagramMetadata: __type(name: "InstagramMetadataInput") {
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
      facebookMetadata: __type(name: "FacebookMetadataInput") {
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
  console.log('Detailed types:', JSON.stringify(json, null, 2));
}

inspectTypes().catch(console.error);
