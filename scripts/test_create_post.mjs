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

const instagramChannelId = '6a8618c9ccaf649a67da4a14';
const facebookChannelId = '6a861a03ccaf649a67da63f2';
const linkedinChannelId = '6a85e433ccaf649a67d85bd7';

const mutation = `
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess {
      post {
        id
        text
        dueAt
      }
    }
    ... on MutationError {
      message
    }
  }
}
`;

async function testInstagram() {
  console.log('--- Testing Instagram CreatePost ---');
  const input = {
    channelId: instagramChannelId,
    text: '🚀 Testing AI-driven automated posting with Gemini & Buffer API! #AI #Automation',
    schedulingType: 'automatic',
    mode: 'addToQueue',
    assets: [
      {
        image: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1080&auto=format&fit=crop&q=80',
        },
      },
    ],
    metadata: {
      instagram: {
        type: 'post',
        shouldShareToFeed: true,
      },
    },
  };

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const json = await res.json();
  console.log('Instagram result:', JSON.stringify(json, null, 2));
}

async function testFacebook() {
  console.log('\n--- Testing Facebook CreatePost ---');
  const input = {
    channelId: facebookChannelId,
    text: '⚡ Testing Facebook post automation with AI Agency Autopilot!',
    schedulingType: 'automatic',
    mode: 'addToQueue',
    assets: [
      {
        image: {
          url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&auto=format&fit=crop&q=80',
        },
      },
    ],
    metadata: {
      facebook: {
        type: 'post',
      },
    },
  };

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const json = await res.json();
  console.log('Facebook result:', JSON.stringify(json, null, 2));
}

async function run() {
  await testInstagram();
  await testFacebook();
}

run().catch(console.error);
