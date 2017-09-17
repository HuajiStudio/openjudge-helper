export class Problem {
    id: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    inputExample: Array<Array<string>>;
    outputExample: Array<Array<string>>;
    notes: string;
}

export interface Parser {
    parse(html: string): Problem;
}

export interface Requester {
    query(id: Number): Promise<string>;
}

export interface StringCallback {
    (str: string): void;
}