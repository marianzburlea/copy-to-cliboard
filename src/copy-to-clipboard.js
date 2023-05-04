#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const copyToClipboard = (content) => {
  if (process.platform === 'win32') {
    execSync('clip').stdin.end(Buffer.from(content, 'utf8'))
  } else {
    execSync(`echo "${content.replace(/"/g, '\\"')}" | pbcopy`)
  }
}

;(async () => {
  const folderPath = process.argv[2]
  console.log('folderPath')
  console.log(folderPath)

  const files = await fs.promises.readdir(folderPath)

  let count = 0
  let allFileContents = ''

  for (const filename of files) {
    const filePath = path.join(folderPath, filename)
    const stat = await fs.promises.stat(filePath)
    if (stat.isFile()) {
      const extname = path.extname(filePath).toLowerCase()
      if (/\.(jsx?|tsx?)$/.test(extname)) {
        const relativePath = path.relative(folderPath, filePath)
        const comment = `// ${relativePath}\n`
        const fileContents =
          comment + (await fs.promises.readFile(filePath, 'utf8'))
        allFileContents += fileContents + '\n'
        count++
      }
    }
  }

  copyToClipboard(allFileContents)
  console.log(`Copied ${count} files to clipboard.`)
})()
