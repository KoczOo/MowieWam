export interface Review {
  readonly author_name: string;
  readonly text: string;
  readonly relative_time_description: string;
  readonly rating: number;
  readonly time?: number;
}

export interface PlaceDetailsResponse {
  readonly result?: {
    readonly name?: string;
    readonly rating?: number;
    readonly user_ratings_total?: number;
    readonly reviews?: ReadonlyArray<Review>;
  };
  readonly status?: string;
}

export type Reviews = Review;
