import path from "path"
import fs from "fs"
import chokidar from "chokidar"
import AppendReader from "./reader"

const DefaultInterval = 1000

interface observer {
  listener: (newLines: string[]) => any
}

class FileAppend {
  private static instance?: FileAppend
  private targetDir: string
  private chokiPath: string
  private interval: number

  private reloader?: NodeJS.Timeout
  private dirWatcher?: chokidar.FSWatcher
  private fileReaders: { [key: string]: AppendReader } = {} //: AppendReader[] = []
  private observers: observer[] = []

  private constructor(directory: string, filename: string, interval: number) {
    this.targetDir = directory
    this.chokiPath = path.join(directory, filename)
    this.interval = interval
  }

  private reloadDir() {
    const files = fs
      .readdirSync(this.targetDir, { withFileTypes: true })
      .filter((ent) => ent.isFile())
    files.forEach((file) => {
      fs.statSync(path.join(this.targetDir, file.name))
    })
  }

  /**
   * 更新が検知された時
   */
  private callReader(path: string, size: number) {
    const reader = this.fileReaders[path]
    if (reader) {
      reader.getAppend(size)
    } else {
      const newReader = new AppendReader(path, (lines) => this.notify(lines))
      this.fileReaders[path] = newReader
      this.fileReaders[path].getAppend(size)
    }
  }

  private startWatcher() {
    this.reloader = setInterval(() => this.reloadDir(), this.interval)

    this.dirWatcher = chokidar.watch(this.chokiPath, {
      ignored: /(^|[\/\\])\../,
    })
    this.dirWatcher.on("change", (path, stats) => {
      if (!stats) return
      this.callReader(path, stats.size)
    })
  }

  private stopWatcher() {
    if (this.reloader) clearInterval(this.reloader)
    if (this.dirWatcher) this.dirWatcher.close()
  }

  /**
   * ファイルの更新をobserverに通知
   */
  private notify(lines: string[]) {
    this.observers.forEach((observer) => {
      observer.listener(lines)
    })
  }
  /**
   * ファイル監視に登録
   */
  public regist(listener: (newLines: string[]) => any) {
    if (this.observers.length == 0) this.startWatcher()
    this.observers.push({ listener })
  }
  /**
   * ファイル監視から登録解除
   */
  public unregist(listener: (newLines: string[]) => any) {
    this.observers.splice(this.observers.indexOf({ listener }), 1)
    if (this.observers.length == 0) this.stopWatcher()
  }
  /**
   * すべての監視を解除
   */
  public unregistAll() {
    this.fileReaders = {}
    this.observers.length = 0
    this.stopWatcher()
  }
  /**
   * @param directory Directory of file
   * @param filename File name matching string (wildcard is "*")
   * @param interval Interval time of
   */
  public static getInstance(
    directory: string,
    filename?: string,
    interval?: number,
  ) {
    if (!filename) filename = "*"
    if (!interval) interval = DefaultInterval

    if (!this.instance) {
      this.instance = new FileAppend(directory, filename, interval)
    }
    return this.instance
  }
}

export default FileAppend
