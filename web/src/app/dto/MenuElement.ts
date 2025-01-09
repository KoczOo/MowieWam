export class MenuElement {
    header: string;
    url?: string;
    exact: boolean;

    constructor(header: string, url: string, exact: boolean) {
        this.header = header;
        this.url = url;
        this.exact = exact;
    }
}
