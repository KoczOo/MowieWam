export class Reviews {
    author_name: string;
    text: string;
    relative_time_description: string;
    rating: number;

    constructor(author_name: string, text: string, relative_time_description: string, rating: number) {
        this.author_name = author_name;
        this.text = text;
        this.relative_time_description = relative_time_description;
        this.rating = rating;
    }
}
