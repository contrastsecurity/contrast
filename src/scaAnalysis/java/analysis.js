const child_process = require('child_process')
const path = require('path')
const i18n = require('i18n')
const fs = require('fs')

const MAVEN = 'maven'
const GRADLE = 'gradle'

const determineProjectTypeAndCwd = (files, config) => {
  const projectData = {}

  if (files.length > 1) {
    files = files.filter(i => config.fileName.includes(i))
  }

  if (files[0].includes('pom.xml')) {
    projectData.projectType = MAVEN
  } else if (files[0].includes('build.gradle')) {
    projectData.projectType = GRADLE
  }

  //clean up the path to be a folder not a file
  projectData.cwd = config.file
    ? config.file.replace('pom.xml', '').replace('build.gradle', '')
    : config.file

  return projectData
}

const buildMaven = (config, projectData, timeout) => {
  let cmdStdout
  let mvn_settings = ''

  try {
    // Allow users to provide a custom location for their settings.xml
    if (config.mavenSettingsPath) {
      mvn_settings = ' -s ' + config.mavenSettingsPath
    }
    cmdStdout = child_process.execSync(
      'mvn dependency:tree -B' + mvn_settings,
      {
        cwd: projectData.cwd,
        timeout
      }
    )
    return cmdStdout.toString()
  } catch (err) {
    throw new Error(
      i18n.__('mavenDependencyTreeNonZero', projectData.cwd, `${err.message}`)
    )
  }
}

const buildGradle = (config, projectData, timeout) => {
  let cmdStdout
  let output = {}

  try {
    // path.sep is user here to either execute as "./gradlew" for UNIX/Linux/MacOS
    // & ".\gradlew" for Windows
    // Check if the user has specified a sub-project
    if (config.subProject) {
      cmdStdout = child_process.execSync(
        '.' +
          path.sep +
          'gradlew :' +
          config.subProject +
          ':dependencies --configuration runtimeClasspath',
        {
          cwd: projectData.cwd,
          timeout
        }
      )
    } else {
      cmdStdout = child_process.execSync(
        '.' +
          path.sep +
          'gradlew dependencies --configuration runtimeClasspath',
        {
          cwd: projectData.cwd,
          timeout
        }
      )
    }
    if (
      cmdStdout
        .toString()
        .includes(
          "runtimeClasspath - Runtime classpath of source set 'main'.\n" +
            'No dependencies'
        )
    ) {
      cmdStdout = child_process.execSync(
        '.' + path.sep + 'gradlew dependencies',
        {
          cwd: projectData.cwd,
          timeout
        }
      )
    }
    output = cmdStdout.toString()
    return output
  } catch (err) {
    if (
      fs.existsSync(projectData.cwd + 'gradlew') ||
      fs.existsSync(projectData.cwd + 'gradlew.bat')
    ) {
      throw new Error(
        i18n.__(
          'gradleDependencyTreeNonZero',
          projectData.cwd,
          `${err.message}`
        )
      )
    } else {
      throw new Error(
        i18n.__('gradleWrapperUnavailable', projectData.cwd, `${err.message}`)
      )
    }
  }
}

const getJavaBuildDeps = (config, files) => {
  const timeout = 960000
  let output = {
    mvnDependancyTreeOutput: undefined,
    projectType: undefined
  }

  try {
    const projectData = determineProjectTypeAndCwd(files, config)
    if (projectData.projectType === MAVEN) {
      output.mvnDependancyTreeOutput = buildMaven(config, projectData, timeout)
    } else if (projectData.projectType === GRADLE) {
      output.mvnDependancyTreeOutput = buildGradle(config, projectData, timeout)
    }
    output.projectType = projectData.projectType
    return output
  } catch (err) {
    console.log(err.message.toString())
  }
}

module.exports = {
  getJavaBuildDeps,
  determineProjectTypeAndCwd
}
