const fg = require('fast-glob')
const fs = require('fs')
const i18n = require('i18n')

const findFile = async () => {
  console.log(i18n.__('searchingScanFileDirectory', process.cwd()))
  return fg(['**/*.jar', '**/*.war', '**/*.zip', '**/*.dll', '**/*.exe'], {
    dot: false,
    deep: 3,
    onlyFiles: true
  })
}

const findAllFiles = async filePath => {
  const result = await fg(
    [
      '**/pom.xml',
      '**/build.gradle',
      '**/build.gradle.kts',
      '**/package.json',
      '**/Pipfile',
      '**/*.csproj',
      '**/Gemfile',
      '**/go.mod'
    ],
    {
      dot: false,
      deep: 2,
      onlyFiles: true,
      absolute: true,
      cwd: filePath ? filePath : process.cwd()
    }
  )

  if (result.length > 0) {
    return result
  }
  return []
}

const findFilesJava = async (languagesFound, filePath) => {
  const result = await fg(
    ['**/pom.xml', '**/build.gradle', '**/build.gradle.kts'],
    {
      dot: false,
      deep: 1,
      onlyFiles: true,
      cwd: filePath ? filePath : process.cwd()
    }
  )

  if (result.length > 0) {
    return languagesFound.push({ JAVA: result })
  }
  return languagesFound
}

const findFilesJavascript = async (languagesFound, filePath) => {
  const result = await fg(
    ['**/package.json', '**/yarn.lock', '**/package-lock.json'],
    {
      dot: false,
      deep: 1,
      onlyFiles: true,
      cwd: filePath ? filePath : process.cwd()
    }
  )

  if (result.length > 0) {
    return languagesFound.push({ JAVASCRIPT: result })
  }
  return languagesFound
}

const findFilesPython = async (languagesFound, filePath) => {
  const result = await fg(['**/Pipfile.lock', '**/Pipfile'], {
    dot: false,
    deep: 3,
    onlyFiles: true,
    cwd: filePath ? filePath : process.cwd()
  })

  if (result.length > 0) {
    return languagesFound.push({ PYTHON: result })
  }
  return languagesFound
}

const findFilesGo = async (languagesFound, filePath) => {
  const result = await fg(['**/go.mod'], {
    dot: false,
    deep: 3,
    onlyFiles: true,
    cwd: filePath ? filePath : process.cwd()
  })

  if (result.length > 0) {
    return languagesFound.push({ GO: result })
  }
  return languagesFound
}

const findFilesRuby = async (languagesFound, filePath) => {
  const result = await fg(['**/Gemfile', '**/Gemfile.lock'], {
    dot: false,
    deep: 3,
    onlyFiles: true,
    cwd: filePath ? filePath : process.cwd()
  })

  if (result.length > 0) {
    return languagesFound.push({ RUBY: result })
  }
  return languagesFound
}

const findFilesPhp = async (languagesFound, filePath) => {
  const result = await fg(['**/composer.json', '**/composer.lock'], {
    dot: false,
    deep: 3,
    onlyFiles: true,
    cwd: filePath ? filePath : process.cwd()
  })

  if (result.length > 0) {
    return languagesFound.push({ PHP: result })
  }
  return languagesFound
}

const findFilesDotNet = async (languagesFound, filePath) => {
  const result = await fg(['**/*.csproj', '**/packages.lock.json'], {
    dot: false,
    deep: 3,
    onlyFiles: true,
    cwd: filePath ? filePath : process.cwd()
  })

  if (result.length > 0) {
    return languagesFound.push({ DOTNET: result })
  }
  return languagesFound
}

const checkFilePermissions = file => {
  let readableFile = false
  try {
    fs.accessSync(file, fs.constants.R_OK)
    return (readableFile = true) // testing purposes
  } catch (err) {
    console.log('Invalid permissions found on ', file)
    process.exit(0)
  }
}

const fileExists = path => {
  return fs.existsSync(path)
}

const fileIsEmpty = path => {
  if (fileExists(path) && checkFilePermissions(path)) {
    try {
      return fs.readFileSync(path).length === 0
    } catch (e) {
      if (
        e.message.toString().includes('illegal operation on a directory, read')
      ) {
        console.log('file provided cannot be a directory')
      } else {
        console.log(e.message.toString())
      }
      process.exit(0)
    }
  }
  return false
}

module.exports = {
  findFile,
  fileExists,
  checkFilePermissions,
  findFilesJava,
  findFilesJavascript,
  findFilesPython,
  findFilesGo,
  findFilesPhp,
  findFilesRuby,
  findFilesDotNet,
  fileIsEmpty,
  findAllFiles
}
