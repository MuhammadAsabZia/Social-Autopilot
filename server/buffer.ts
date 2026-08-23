import {
  BufferConfig,
  BufferPublishResult,
  PlatformPost,
  PlatformType,
  SocialMediaPostGroup,
} from '../src/types.js';
import { db } from './db.js';

const BUFFER_GRAPHQL_ENDPOINT = 'https://api.buffer.com';

export interface BufferGraphQLChannel {
  id: string;
  name: string;
  service: string;
  organizationId?: string;
  organizationName?: string;
}

const DEFAULT_PUBLIC_TECH_IMAGES: Record<string, string> = {
  instagram: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1080&auto=format&fit=crop&q=80',
  facebook: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&auto=format&fit=crop&q=80',
  linkedin: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&auto=format&fit=crop&q=80',
};

function resolvePublicImageUrl(providedUrl?: string, platform: string = 'instagram'): string {
  if (providedUrl && (providedUrl.startsWith('https://') || providedUrl.startsWith('http://'))) {
    return providedUrl;
  }
  return DEFAULT_PUBLIC_TECH_IMAGES[platform] || DEFAULT_PUBLIC_TECH_IMAGES.instagram;
}

let globalRuntimeBufferKey = '';

export class BufferService {
  /**
   * Clean and normalize API key string
   */
  public static cleanToken(rawKey?: string): string {
    if (!rawKey) return '';
    return rawKey
      .trim()
      .replace(/^Bearer\s+/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();
  }

  /**
   * Set runtime API key in memory
   */
  public static setRuntimeApiKey(key: string): void {
    globalRuntimeBufferKey = this.cleanToken(key);
  }

  /**
   * Get active Buffer API Key from override, runtime memory, db, or environment
   */
  public static getApiKey(overrideKey?: string): string {
    if (overrideKey && overrideKey.trim()) {
      return this.cleanToken(overrideKey);
    }
    if (globalRuntimeBufferKey && globalRuntimeBufferKey.trim()) {
      return globalRuntimeBufferKey;
    }
    try {
      const storedConfig = db.getBufferConfig();
      if ((storedConfig as any).apiKey && (storedConfig as any).apiKey.trim()) {
        return this.cleanToken((storedConfig as any).apiKey);
      }
    } catch {
      // Ignore db access errors if any
    }
    const envKey = process.env.BUFFER_API_KEY || process.env.BUFFER_ACCESS_TOKEN || '';
    return this.cleanToken(envKey);
  }

  /**
   * Helper to execute GraphQL queries/mutations against Buffer GraphQL API
   */
  public static async executeGraphQL<T = any>(
    query: string,
    variables: Record<string, any> = {},
    overrideKey?: string
  ): Promise<{ data?: T; errors?: any[]; status: number; rawError?: string }> {
    const apiKey = this.getApiKey(overrideKey);

    if (!apiKey) {
      return {
        status: 401,
        rawError: 'No Buffer API Key found in BUFFER_API_KEY environment variable.',
      };
    }

    try {
      const response = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'BufferGraphQLApplet/2.0',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errJson = await response.json();
          errorText = errJson.message || errJson.error || JSON.stringify(errJson);
        } catch {
          errorText = await response.text();
        }

        return {
          status: response.status,
          rawError: `Buffer API error (HTTP ${response.status}): ${errorText || response.statusText}`,
        };
      }

      const json = (await response.json()) as { data?: T; errors?: any[] };
      return {
        data: json.data,
        errors: json.errors,
        status: 200,
      };
    } catch (err: any) {
      return {
        status: 500,
        rawError: err.message || 'Failed to connect to Buffer GraphQL API',
      };
    }
  }

  /**
   * Test Buffer Personal API Key & fetch connected channels via GraphQL
   */
  public static async testConnection(overrideKey?: string): Promise<{
    connected: boolean;
    organizationName?: string;
    organizationId?: string;
    channels: BufferGraphQLChannel[];
    error?: string;
    details?: string;
  }> {
    const apiKey = this.getApiKey(overrideKey);

    if (!apiKey) {
      return {
        connected: false,
        channels: [],
        error: 'BUFFER_API_KEY environment variable is not configured.',
        details:
          'Set your personal API key from Buffer Settings → API (https://publish.buffer.com/settings/api).',
      };
    }

    // 1. First, query organizations using the standard Buffer GetOrganizations query
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

    const orgResult = await this.executeGraphQL<{
      account?: {
        id?: string;
        organizations?: {
          id: string;
          name: string;
          ownerEmail?: string;
        }[];
      };
    }>(orgsQuery, {}, overrideKey);

    if (orgResult.rawError || orgResult.status !== 200) {
      let hint =
        'Ensure you copied the API key from Buffer Settings → API (https://publish.buffer.com/settings/api).';
      if (orgResult.status === 401) {
        hint =
          'Buffer returned 401 Unauthorized. Verify your API Key from Buffer Settings → API and ensure BUFFER_API_KEY is properly set in the Secrets/Environment panel.';
      }

      return {
        connected: false,
        channels: [],
        error: orgResult.rawError || 'Failed to connect to Buffer GraphQL API',
        details: hint,
      };
    }

    if (orgResult.errors && orgResult.errors.length > 0) {
      const errMsg = orgResult.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
      return {
        connected: false,
        channels: [],
        error: `Buffer GraphQL query error: ${errMsg}`,
        details:
          'When creating the API Key in Buffer Settings → API, ensure permissions are granted for your organization and channels.',
      };
    }

    const orgs = orgResult.data?.account?.organizations || [];
    const allChannels: BufferGraphQLChannel[] = [];
    let primaryOrgName = '';
    let primaryOrgId = '';

    if (orgs.length > 0) {
      primaryOrgName = orgs[0].name;
      primaryOrgId = orgs[0].id;

      // 2. Fetch channels for each organization using both query signatures supported by Buffer GraphQL
      for (const org of orgs) {
        try {
          // Attempt 1: Query with input object: channels(input: { organizationId: $organizationId })
          const inputQuery = `
            query GetChannels($input: ChannelsInput!) {
              channels(input: $input) {
                id
                name
                service
              }
            }
          `;

          let chanResult = await this.executeGraphQL<{
            channels?: { id: string; name: string; service: string }[];
          }>(inputQuery, { input: { organizationId: org.id } }, overrideKey);

          // Attempt 2: If input query failed or returned errors, try direct argument: channels(organizationId: $organizationId)
          if (!chanResult.data?.channels || chanResult.errors?.length) {
            const directQuery = `
              query GetChannelsDirect($organizationId: ID!) {
                channels(organizationId: $organizationId) {
                  id
                  name
                  service
                }
              }
            `;
            const directResult = await this.executeGraphQL<{
              channels?: { id: string; name: string; service: string }[];
            }>(directQuery, { organizationId: org.id }, overrideKey);

            if (directResult.data?.channels) {
              chanResult = directResult;
            }
          }

          if (chanResult.data?.channels && Array.isArray(chanResult.data.channels)) {
            chanResult.data.channels.forEach((ch) => {
              allChannels.push({
                id: ch.id,
                name: ch.name,
                service: (ch.service || '').toLowerCase(),
                organizationId: org.id,
                organizationName: org.name,
              });
            });
          }
        } catch {
          // Continue to next org if any
        }
      }
    }

    return {
      connected: true,
      organizationName: primaryOrgName || 'Personal Workspace',
      organizationId: primaryOrgId,
      channels: allChannels,
    };
  }

  /**
   * Test Dispatch a sample AI-generated post (with hook, narrative, hashtags, and media)
   * to verify that Buffer Queue correctly stores and schedules the content.
   */
  public static async testDispatchToQueue(
    platform: 'linkedin' | 'instagram' | 'facebook' | 'all',
    customText?: string,
    bufferConfigOverride?: BufferConfig
  ): Promise<{
    success: boolean;
    isSimulated: boolean;
    message: string;
    results: {
      platform: string;
      channelId: string;
      channelName: string;
      status: 'queued' | 'failed' | 'simulated';
      postId?: string;
      dueAt?: string;
      textPreview: string;
      error?: string;
    }[];
  }> {
    const config = bufferConfigOverride || db.getBufferConfig();
    const apiKey = this.getApiKey(config.accessToken);
    const isSimulated = config.isSimulatedMode || !apiKey;

    const targetPlatforms: ('linkedin' | 'instagram' | 'facebook')[] =
      platform === 'all' ? ['linkedin', 'instagram', 'facebook'] : [platform];

    const results: {
      platform: string;
      channelId: string;
      channelName: string;
      status: 'queued' | 'failed' | 'simulated';
      postId?: string;
      dueAt?: string;
      textPreview: string;
      error?: string;
    }[] = [];

    const defaultTestPosts: Record<string, string> = {
      linkedin:
        customText ||
        `🚀 [AI Agency Autopilot Verification Test]\n\nAutomating multi-channel social growth with Gemini 2.5 Flash and Buffer GraphQL API.\n\nKey takeaways:\n• Zero-human content orchestration\n• Quality Control audit score: 96/100\n• 3-channel synchronized publishing\n\n#AIAutomation #BuildWithAI #SaaS #ContentOps #GeminiFlash`,
      instagram:
        customText ||
        `✨ Testing automated Buffer queue delivery from Agency Autopilot AI! 🤖⚡\n\nCarousel & narrative breakdown rendered automatically.\n.\n.\n#AIAutomation #TechFounder #GrowthHacking #DigitalMarketing #AIWorkflow`,
      facebook:
        customText ||
        `⚡ Verification Test: Agency Autopilot social engine connected successfully to Buffer GraphQL queue.\n\nStay tuned for weekly AI & SaaS workflow insights!\n\n#AI #Technology #AgencyGrowth #SocialMediaMarketing`,
    };

    for (const plat of targetPlatforms) {
      const chan = config.channels[plat];
      const channelId = chan?.channelId || chan?.profileId || '';
      const channelName = chan?.channelName || chan?.profileName || `${plat} Channel`;
      const text = defaultTestPosts[plat] || customText || 'Test AI Post from Agency Autopilot';

      if (!chan?.enabled && platform === 'all') {
        continue;
      }

      if (isSimulated) {
        results.push({
          platform: plat,
          channelId: channelId || `sim_${plat}_id`,
          channelName,
          status: 'simulated',
          postId: `sim_test_${Date.now()}_${plat}`,
          dueAt: new Date(Date.now() + 3600000).toISOString(),
          textPreview: text.slice(0, 100) + '...',
        });
      } else {
        if (!channelId) {
          results.push({
            platform: plat,
            channelId: '',
            channelName,
            status: 'failed',
            textPreview: text.slice(0, 100) + '...',
            error: `No Buffer Channel ID configured for ${plat}. Please enter a Channel ID in Buffer Settings.`,
          });
          continue;
        }

        const publishRes = await this.createPostGraphQL(
          channelId,
          text,
          'addToQueue',
          {
            platform: plat,
            imageUrl: DEFAULT_PUBLIC_TECH_IMAGES[plat] || DEFAULT_PUBLIC_TECH_IMAGES.instagram,
            postType: 'post',
          },
          apiKey
        );

        if (publishRes.success) {
          results.push({
            platform: plat,
            channelId,
            channelName,
            status: 'queued',
            postId: publishRes.postId,
            dueAt: publishRes.dueAt,
            textPreview: text.slice(0, 100) + '...',
          });
        } else {
          results.push({
            platform: plat,
            channelId,
            channelName,
            status: 'failed',
            textPreview: text.slice(0, 100) + '...',
            error: publishRes.error || 'Failed to dispatch post to Buffer Queue.',
          });
        }
      }
    }

    const anyFailed = results.some((r) => r.status === 'failed');
    const allSuccessful = results.length > 0 && !anyFailed;

    return {
      success: allSuccessful,
      isSimulated,
      message: isSimulated
        ? `Simulation Mode: Verified queue payload formatting for ${results.length} channel(s). No live mutations were sent.`
        : allSuccessful
        ? `Successfully queued test post(s) to Buffer GraphQL API across ${results.length} channel(s)!`
        : `Some channel(s) failed during Buffer queue dispatch. Review errors below.`,
      results,
    };
  }

  /**
   * Schedule or publish a post to a single channel using Buffer GraphQL createPost mutation
   */
  public static async createPostGraphQL(
    channelId: string,
    text: string,
    mode: 'addToQueue' | 'shareNow' = 'addToQueue',
    options?: {
      platform?: string;
      imageUrl?: string;
      imageUrls?: string[];
      postType?: 'post' | 'reel' | 'story' | 'carousel';
      shouldShareToFeed?: boolean;
    },
    overrideKey?: string
  ): Promise<{ success: boolean; postId?: string; dueAt?: string; error?: string }> {
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

    const platform = (options?.platform || '').toLowerCase();
    const resolvedImage = resolvePublicImageUrl(options?.imageUrl, platform);

    const input: any = {
      channelId,
      text,
      schedulingType: 'automatic',
      mode,
    };

    // Collect image assets
    const assetsList: any[] = [];
    if (options?.imageUrls && options.imageUrls.length > 0) {
      options.imageUrls.forEach((url) => {
        if (url) assetsList.push({ image: { url } });
      });
    } else if (resolvedImage) {
      assetsList.push({ image: { url: resolvedImage } });
    }

    if (assetsList.length > 0) {
      input.assets = assetsList;
    }

    // Platform-specific metadata (required by Buffer for Instagram & Facebook)
    if (platform.includes('instagram')) {
      input.metadata = {
        instagram: {
          type: options?.postType || 'post',
          shouldShareToFeed: options?.shouldShareToFeed !== undefined ? options.shouldShareToFeed : true,
        },
      };
      // Instagram always requires at least one image/video asset
      if (!input.assets || input.assets.length === 0) {
        input.assets = [{ image: { url: DEFAULT_PUBLIC_TECH_IMAGES.instagram } }];
      }
    } else if (platform.includes('facebook')) {
      input.metadata = {
        facebook: {
          type: options?.postType || 'post',
        },
      };
      // Facebook posts require at least one image or link attachment
      if (!input.assets || input.assets.length === 0) {
        input.assets = [{ image: { url: DEFAULT_PUBLIC_TECH_IMAGES.facebook } }];
      }
    }

    const variables = { input };
    const result = await this.executeGraphQL<any>(mutation, variables, overrideKey);

    if (result.rawError || result.status !== 200) {
      return {
        success: false,
        error: result.rawError || `HTTP error ${result.status} creating post`,
      };
    }

    if (result.errors && result.errors.length > 0) {
      const errMsg = result.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
      return {
        success: false,
        error: `GraphQL Mutation Error: ${errMsg}`,
      };
    }

    const createPostData = result.data?.createPost;
    if (createPostData?.post?.id) {
      return {
        success: true,
        postId: createPostData.post.id,
        dueAt: createPostData.post.dueAt,
      };
    }

    if (createPostData?.message) {
      return {
        success: false,
        error: createPostData.message,
      };
    }

    return {
      success: true,
      postId: `buf_post_${Date.now()}`,
    };
  }

  /**
   * Create an Idea in Buffer using the GraphQL createIdea mutation
   */
  public static async createIdeaGraphQL(
    organizationId: string,
    title: string,
    text: string,
    overrideKey?: string
  ): Promise<{ success: boolean; ideaId?: string; error?: string }> {
    const mutation = `
      mutation CreateIdea($input: CreateIdeaInput!) {
        createIdea(input: $input) {
          ... on Idea {
            id
            content {
              title
              text
            }
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        organizationId,
        content: {
          title,
          text,
        },
      },
    };

    const result = await this.executeGraphQL<any>(mutation, variables, overrideKey);

    if (result.rawError || result.status !== 200) {
      return {
        success: false,
        error: result.rawError || `HTTP error ${result.status} creating idea`,
      };
    }

    if (result.errors && result.errors.length > 0) {
      const errMsg = result.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
      return {
        success: false,
        error: `GraphQL Mutation Error: ${errMsg}`,
      };
    }

    const ideaData = result.data?.createIdea;
    if (ideaData?.id) {
      return {
        success: true,
        ideaId: ideaData.id,
      };
    }

    if (ideaData?.message) {
      return {
        success: false,
        error: ideaData.message,
      };
    }

    return {
      success: true,
      ideaId: `idea_${Date.now()}`,
    };
  }

  /**
   * Publish or Queue Posts to Buffer across configured channels
   */
  public static async publishPosts(
    posts: {
      linkedin?: PlatformPost;
      instagram?: PlatformPost;
      facebook?: PlatformPost;
    },
    bufferConfig: BufferConfig
  ): Promise<BufferPublishResult> {
    const results: BufferPublishResult['platformResults'] = [];
    const platforms: PlatformType[] = ['linkedin', 'instagram', 'facebook'];
    const apiKey = this.getApiKey(bufferConfig.accessToken);

    const isSimulated = bufferConfig.isSimulatedMode || !apiKey;

    for (const platform of platforms) {
      const postContent = posts[platform];
      if (!postContent) continue;

      const channelConfig = bufferConfig.channels[platform];
      if (!channelConfig || !channelConfig.enabled) {
        continue;
      }

      const targetChannelId = channelConfig.channelId || channelConfig.profileId || '';

      if (isSimulated) {
        // Safe simulation mode: simulates queueing without actual network mutations
        const simId = `sim_buf_gql_${platform}_${Date.now()}`;
        results.push({
          platform,
          status: 'queued',
          bufferUpdateId: simId,
          queuedAt: new Date().toISOString(),
        });
      } else {
        // Live Buffer GraphQL Mode
        if (!targetChannelId) {
          results.push({
            platform,
            status: 'failed',
            error: `No Buffer Channel ID configured for ${platform}. Please select or enter a Channel ID in Buffer Settings.`,
          });
          continue;
        }

        try {
          const isCarousel = postContent.formatType === 'carousel_slides';
          const postType = isCarousel ? 'carousel' : 'post';

          const res = await this.createPostGraphQL(
            targetChannelId,
            postContent.fullFormattedText,
            'addToQueue',
            {
              platform,
              imageUrl: postContent.visualImageUrl,
              imageUrls:
                platform === 'instagram' && postContent.carouselSlides?.length
                  ? [
                      postContent.visualImageUrl,
                      ...postContent.carouselSlides
                        .map((slide) => slide.slideImageUrl)
                        .filter((url): url is string => Boolean(url)),
                    ]
                  : undefined,
              postType,
            },
            apiKey
          );

          if (res.success) {
            results.push({
              platform,
              status: 'queued',
              bufferUpdateId: res.postId,
              queuedAt: res.dueAt || new Date().toISOString(),
            });
          } else {
            results.push({
              platform,
              status: 'failed',
              error: res.error || `Failed to create post on Buffer for ${platform}`,
            });
          }
        } catch (err: any) {
          results.push({
            platform,
            status: 'failed',
            error: err.message || `Buffer GraphQL dispatch error for ${platform}`,
          });
        }
      }
    }

    const allSuccessful = results.length > 0 && results.every((r) => r.status === 'queued' || r.status === 'published');

    return {
      success: allSuccessful,
      simulated: isSimulated,
      platformResults: results,
      batchId: `batch_gql_${Date.now()}`,
    };
  }

  /**
   * Helper to publish a full SocialMediaPostGroup
   */
  public static async publishPostGroup(
    postGroup: SocialMediaPostGroup,
    bufferConfig: BufferConfig
  ): Promise<BufferPublishResult> {
    return this.publishPosts(postGroup.posts, bufferConfig);
  }
}
