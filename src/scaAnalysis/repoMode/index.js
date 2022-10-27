const mavenParser = require('./mavenParser')
const gradleParser = require('./gradleParser')
const { determineProjectTypeAndCwd } = require('../java/analysis')

const buildRepo = async (config, languageFiles) => {
  const project = determineProjectTypeAndCwd(languageFiles.JAVA, config)

  if (project.projectType === 'maven') {
    let jsonPomFile = mavenParser.readPomFile(project)
    mavenParser.parsePomFile(jsonPomFile)
  } else if (project.projectType === 'gradle') {
    const gradleJson = gradleParser.readBuildGradleFile(project)
    gradleParser.parseGradleJson(await gradleJson)
  } else {
    console.log('Unable to read project files.')
  }
}

module.exports = {
  buildRepo
}
