declare class FileAppend {
    private static instance?;
    private targetDir;
    private chokiPath;
    private interval;
    private reloader?;
    private dirWatcher?;
    private fileReaders;
    private observers;
    private constructor();
    private reloadDir;
    /**
     * 更新が検知された時
     */
    private callReader;
    private startWatcher;
    private stopWatcher;
    /**
     * ファイルの更新をobserverに通知
     */
    private notify;
    /**
     * ファイル監視に登録
     */
    regist(listener: (newLines: string[]) => any): void;
    /**
     * ファイル監視から登録解除
     */
    unregist(listener: (newLines: string[]) => any): void;
    /**
     * すべての監視を解除
     */
    unregistAll(): void;
    /**
     * @param directory Directory of file
     * @param filename File name matching string (wildcard is "*")
     * @param interval Interval time of
     */
    static getInstance(directory: string, filename?: string, interval?: number): FileAppend;
}
export default FileAppend;
