const {
  supportedLanguages: { NODE, DOTNET, JAVA, RUBY, PYTHON, GO, PHP, JAVASCRIPT }
} = require('./constants')
const i18n = require('i18n')

const DOT_NET_PROJECT_FILE_REGEX = /.+\.csproj$/
const DOT_NET_LOCK_FILENAME = 'packages.lock.json'

const isDotNetProjectFilename = filename =>
  filename.search(DOT_NET_PROJECT_FILE_REGEX) !== -1
const isDotNetLockFilename = filename => filename === DOT_NET_LOCK_FILENAME
function isJavaMavenProjectFilename(filename) {
  return filename === 'pom.xml'
}
function isJavaGradleProjectFilename(filename) {
  return filename === 'build.gradle' || filename === 'build.gradle.kts'
}
const isRubyProjectFilename = filename => filename === 'Gemfile'
const isNodeProjectFilename = filename => filename === 'package.json'
const isPythonProjectFilename = filename =>
  filename === 'requirements.txt' || filename === 'Pipfile'
const isPhpProjectFilename = filename => filename === 'composer.json'
const isPhpLockFilename = filename => filename === 'composer.lock'
function isNodeLockFilename(filename) {
  return filename === 'package-lock.json' || filename === 'yarn.lock'
}
const isRubyLockFilename = filename => filename === 'Gemfile.lock'
const isPipfileLockLockFilename = filename => filename === 'Pipfile.lock'
const isGoProjectFilename = filename => filename === 'go.mod'

const deduceLanguage = filename => {
  const deducedLanguages = []

  // In theory there shouldn't be multiple languages supported for a single
  // project filename or lock filename but to protect ourselves and consumers we
  // will try to detect it

  // Check for project filenames...
  if (isJavaMavenProjectFilename(filename)) {
    deducedLanguages.push({ language: JAVA, projectFilename: filename })
  }

  if (isJavaGradleProjectFilename(filename)) {
    deducedLanguages.push({ language: JAVA, projectFilename: filename })
  }

  if (isNodeProjectFilename(filename)) {
    deducedLanguages.push({ language: NODE, projectFilename: filename })
  }

  if (isDotNetProjectFilename(filename)) {
    deducedLanguages.push({ language: DOTNET, projectFilename: filename })
  }

  if (isRubyProjectFilename(filename)) {
    deducedLanguages.push({ language: RUBY, projectFilename: filename })
  }

  if (isPythonProjectFilename(filename)) {
    deducedLanguages.push({ language: PYTHON, projectFilename: filename })
  }

  if (isPhpProjectFilename(filename)) {
    deducedLanguages.push({ language: PHP, projectFilename: filename })
  }

  // Check for lock filenames...
  if (isDotNetLockFilename(filename)) {
    deducedLanguages.push({ language: DOTNET, lockFilename: filename })
  }

  if (isNodeLockFilename(filename)) {
    deducedLanguages.push({ language: NODE, lockFilename: filename })
  }

  if (isRubyLockFilename(filename)) {
    deducedLanguages.push({ language: RUBY, lockFilename: filename })
  }

  // this is pipfileLock rather than python lock as there can be different python locks
  if (isPipfileLockLockFilename(filename)) {
    deducedLanguages.push({ language: PYTHON, lockFilename: filename })
  }

  if (isPhpLockFilename(filename)) {
    deducedLanguages.push({ language: PHP, lockFilename: filename })
  }

  // go does not have a lockfile, it should have a go.mod file containing the modules
  if (isGoProjectFilename(filename)) {
    deducedLanguages.push({ language: GO, projectFilename: filename })
  }

  return deducedLanguages
}

const reduceIdentifiedLanguages = identifiedLanguages =>
  identifiedLanguages.reduce((accumulator, identifiedLanguageInfo) => {
    const { language, projectFilename, lockFilename } = identifiedLanguageInfo

    // Add an entry to our map for an identified language (and its filename)
    // if we haven't accumulated it yet. Otherwise simply add the filename to the
    // existing list.
    if (!(language in accumulator)) {
      accumulator[language] = { projectFilenames: [], lockFilenames: [] }
    }

    if (projectFilename) {
      accumulator[language].projectFilenames.push(projectFilename)
    } else {
      accumulator[language].lockFilenames.push(lockFilename)
    }

    return accumulator
  }, {})

/**
 * Look at each filename and using a heuristic see if we can determine that it
 * specifies a specific language
 */
module.exports = exports = (analysis, next) => {
  const { projectPath, languageAnalysis, config } = analysis

  let identifiedLanguages = languageAnalysis.projectRootFilenames.reduce(
    (accumulator, filename) => {
      const deducedLanguages = deduceLanguage(filename)
      return [...accumulator, ...deducedLanguages]
    },
    []
  )

  if (Object.keys(identifiedLanguages).length === 0) {
    next(new Error(i18n.__('languageAnalysisNoLanguage', projectPath)))
    return
  }

  let language = config.language
  if (language === undefined) {
    languageAnalysis.identifiedLanguages = reduceIdentifiedLanguages(
      identifiedLanguages
    )
  } else {
    let refinedIdentifiedLanguages = []
    for (let x in identifiedLanguages) {
      if (
        identifiedLanguages[x].language === language.toUpperCase() ||
        (identifiedLanguages[x].language === NODE &&
          language.toUpperCase() === JAVASCRIPT)
      ) {
        refinedIdentifiedLanguages.push(identifiedLanguages[x])
      }
    }
    //languages found do not meet that supplied by the user
    if (refinedIdentifiedLanguages.length === 0) {
      console.log(`Could not detect language as specified: ${config.language}`)
      process.exit(1)
    }

    languageAnalysis.identifiedLanguages = reduceIdentifiedLanguages(
      refinedIdentifiedLanguages
    )
  }

  next()
}

//For testing purposes
exports.isJavaMavenProjectFilename = isJavaMavenProjectFilename
exports.isJavaGradleProjectFilename = isJavaGradleProjectFilename
exports.isNodeProjectFilename = isNodeProjectFilename
exports.isDotNetProjectFilename = isDotNetProjectFilename
exports.isDotNetLockFilename = isDotNetLockFilename
exports.isGoProjectFilename = isGoProjectFilename
exports.isPhpProjectFilename = isPhpProjectFilename
exports.isPhpLockFilename = isPhpLockFilename
exports.deduceLanguage = deduceLanguage
exports.reduceIdentifiedLanguages = reduceIdentifiedLanguages
