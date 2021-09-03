# append-reader

Watch file changes and read immediately when something is appended to the file.

# Usage

```ts
import AppendReader from "append-reader"

const DirectoryToWatch = "/path/to/dir"
const FilenamePattern = "*isWildcard.txt"

const watcher = AppendReader.getWatcher(DirectoryToWatch, FilenamePattern)

watcher.regist((lines: string[]) => {
  // read lines appended to file.
  console.log(lines)
})
```
