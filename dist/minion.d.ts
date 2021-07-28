export default class Minion {
    FilePath: string;
    private beforeSize;
    private callback;
    constructor(path: string, callback: (lines: string[]) => any);
    getAppend(newSize: number): Promise<never[] | undefined>;
}
