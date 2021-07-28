import fs from "fs"

export default class Minion {
  public FilePath: string
  private beforeSize: number
  private callback: (arg: string[]) => any

  constructor(path: string, callback: (lines: string[]) => any) {
    this.FilePath = path
    this.beforeSize = 0
    this.callback = callback
  }

  // 増分取得
  public async getAppend(newSize: number) {
    const appendSize = newSize - this.beforeSize
    if (appendSize < 0) return []
    // 前回のサイズの位置から最後までをread
    const buf = Buffer.alloc(appendSize)
    const fh = await fs.promises.open(this.FilePath, "r")
    const readBuf = await fh.read(buf, 0, appendSize, this.beforeSize)
    fh.close()
    this.beforeSize = newSize
    // １行ごとの配列にして、空行を削除
    const lines = readBuf.buffer
      .toString("utf-8")
      .split(/[\n\r]/)
      .filter((line) => !/^\s*$/.test(line))
    this.callback(lines)
  }
}
