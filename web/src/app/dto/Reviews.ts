export interface Review {
  readonly author_name: string;
  readonly text: string;
  readonly relative_time_description: string;
  readonly rating: number;
}

export interface PlaceDetailsResponse {
  readonly result?: {
    readonly name?: string;
    readonly rating?: number;
    readonly reviews?: ReadonlyArray<Review>;
  };
  readonly status?: string;
}

/** @deprecated Kept for backwards compatibility – use `Review` interface instead. */
export type Reviews = Review;
