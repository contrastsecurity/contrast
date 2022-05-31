const child_process = require('child_process')
const fs = require('fs')
const i18n = require('i18n')
const path = require('path')

module.exports = exports = (
  { language: { projectFilePath }, java },
  next,
  config
) => {
  let cmdStdout
  let cwd
  let timeout
  let javaProject = ''
  let mvn_settings = ''
  const maven = 'Maven'
  const gradle = 'Gradle'

  try {
    if (projectFilePath.includes('pom.xml')) {
      javaProject = maven
      cwd = projectFilePath.replace('pom.xml', '')
    } else if (projectFilePath.includes('build.gradle')) {
      javaProject = gradle
      cwd = projectFilePath.replace('build.gradle', '')
    }

    // timeout is in milliseconds and 2.30 mintues was choses as when tested against
    // Spring-boot (https://github.com/spring-projects/spring-boot) a complex project that was the
    // average time for a first run when it had to download projects then build tree
    timeout = 960000

    // A sample of this output can be found
    // in the java test data/mvnCmdResults.text
    if (javaProject === maven) {
      // Allow users to provide a custom location for their settings.xml
      if (config.mavenSettingsPath) {
        mvn_settings = ' -s ' + config.mavenSettingsPath
      }

      if (config.betaUnifiedJavaParser) {
        cmdStdout = child_process.execSync(
          'mvn dependency:tree -B' + mvn_settings,
          {
            cwd,
            timeout
          }
        )
      } else {
        cmdStdout = child_process.execSync(
          'mvn dependency:tree -DoutputType=dot -B' + mvn_settings,
          {
            cwd,
            timeout
          }
        )
      }
      java.mvnDependancyTreeOutput = cmdStdout.toString()
    } else if (javaProject === gradle) {
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
            cwd,
            timeout
          }
        )
      } else {
        cmdStdout = child_process.execSync(
          '.' +
            path.sep +
            'gradlew dependencies --configuration runtimeClasspath',
          {
            cwd,
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
            cwd,
            timeout
          }
        )
      }
      java.mvnDependancyTreeOutput = cmdStdout.toString()
    }
    next()
  } catch (err) {
    if (javaProject === maven) {
      try {
        child_process.execSync('mvn --version', {
          cwd,
          timeout
        })

        next(
          new Error(
            i18n.__('mavenDependencyTreeNonZero', cwd, `${err.message}`)
          )
        )
      } catch (mvnErr) {
        next(
          new Error(i18n.__('mavenNotInstalledError', cwd, `${mvnErr.message}`))
        )
      }
    } else if (javaProject === gradle) {
      if (
        fs.existsSync(cwd + 'gradlew') ||
        fs.existsSync(cwd + 'gradlew.bat')
      ) {
        next(
          new Error(
            i18n.__('gradleDependencyTreeNonZero', cwd, `${err.message}`)
          )
        )
      } else {
        next(
          new Error(i18n.__('gradleWrapperUnavailable', cwd, `${err.message}`))
        )
      }
    }
    return
  }
}
