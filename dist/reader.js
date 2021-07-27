"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class AppendReader {
    constructor(path, callback) {
        this.FilePath = path;
        this.beforeSize = 0;
        this.callback = callback;
    }
    // 増分取得
    async getAppend(newSize) {
        const appendSize = newSize - this.beforeSize;
        if (appendSize < 0)
            return [];
        // 前回のサイズの位置から最後までをread
        const buf = Buffer.alloc(appendSize);
        const fh = await fs_1.default.promises.open(this.FilePath, "r");
        const readBuf = await fh.read(buf, 0, appendSize, this.beforeSize);
        fh.close();
        this.beforeSize = newSize;
        // １行ごとの配列にして、空行を削除
        const lines = readBuf.buffer
            .toString("utf-8")
            .split(/[\n\r]/)
            .filter((line) => !/^\s*$/.test(line));
        this.callback(lines);
    }
}
exports.default = AppendReader;
//# sourceMappingURL=reader.js.map