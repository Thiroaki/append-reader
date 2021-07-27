"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const reader_1 = __importDefault(require("./reader"));
const DefaultInterval = 1000;
class FileAppend {
    constructor(directory, filename, interval) {
        this.fileReaders = {}; //: AppendReader[] = []
        this.observers = [];
        this.targetDir = directory;
        this.chokiPath = path_1.default.join(directory, filename);
        this.interval = interval;
    }
    reloadDir() {
        const files = fs_1.default
            .readdirSync(this.targetDir, { withFileTypes: true })
            .filter((ent) => ent.isFile());
        files.forEach((file) => {
            fs_1.default.statSync(path_1.default.join(this.targetDir, file.name));
        });
    }
    /**
     * 更新が検知された時
     */
    callReader(path, size) {
        const reader = this.fileReaders[path];
        if (reader) {
            reader.getAppend(size);
        }
        else {
            const newReader = new reader_1.default(path, (lines) => this.notify(lines));
            this.fileReaders[path] = newReader;
            this.fileReaders[path].getAppend(size);
        }
    }
    startWatcher() {
        this.reloader = setInterval(() => this.reloadDir(), this.interval);
        this.dirWatcher = chokidar_1.default.watch(this.chokiPath, {
            ignored: /(^|[\/\\])\../,
        });
        this.dirWatcher.on("change", (path, stats) => {
            if (!stats)
                return;
            this.callReader(path, stats.size);
        });
    }
    stopWatcher() {
        if (this.reloader)
            clearInterval(this.reloader);
        if (this.dirWatcher)
            this.dirWatcher.close();
    }
    /**
     * ファイルの更新をobserverに通知
     */
    notify(lines) {
        this.observers.forEach((observer) => {
            observer.listener(lines);
        });
    }
    /**
     * ファイル監視に登録
     */
    regist(listener) {
        if (this.observers.length == 0)
            this.startWatcher();
        this.observers.push({ listener });
    }
    /**
     * ファイル監視から登録解除
     */
    unregist(listener) {
        this.observers.splice(this.observers.indexOf({ listener }), 1);
        if (this.observers.length == 0)
            this.stopWatcher();
    }
    /**
     * すべての監視を解除
     */
    unregistAll() {
        this.fileReaders = {};
        this.observers.length = 0;
        this.stopWatcher();
    }
    /**
     * @param directory Directory of file
     * @param filename File name matching string (wildcard is "*")
     * @param interval Interval time of
     */
    static getInstance(directory, filename, interval) {
        if (!filename)
            filename = "*";
        if (!interval)
            interval = DefaultInterval;
        if (!this.instance) {
            this.instance = new FileAppend(directory, filename, interval);
        }
        return this.instance;
    }
}
exports.default = FileAppend;
//# sourceMappingURL=index.js.map