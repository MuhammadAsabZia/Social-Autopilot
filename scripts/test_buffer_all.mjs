import { BufferService } from '../server/buffer.js';
import { db } from '../server/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function testBuffer() {
  const config = db.getBufferConfig();
  console.log('Buffer config channels:', JSON.stringify(config.channels, null, 2));

  for (const plat of ['linkedin', 'instagram', 'facebook']) {
    console.log(`\n--- Testing ${plat} ---`);
    const chan = config.channels[plat];
    if (!chan) {
      console.log(`No channel for ${plat}`);
      continue;
    }
    const res = await BufferService.createPostGraphQL(
      chan.channelId,
      `Testing Buffer connection for ${plat} at ${new Date().toISOString()}`,
      'addToQueue',
      {
        platform: plat,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1080&auto=format&fit=crop&q=80',
        postType: 'post'
      }
    );
    console.log(`Result for ${plat}:`, res);
  }
}

testBuffer();
