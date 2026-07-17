export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface InstagramPost {
  readonly id: string;
  readonly caption?: string;
  readonly media_type: InstagramMediaType;
  readonly media_url: string;
  readonly thumbnail_url?: string;
  readonly permalink: string;
  readonly timestamp: string;
}

export interface InstagramPostsResponse {
  readonly posts: ReadonlyArray<InstagramPost>;
}
