const commonApi = require('../utils/commonApi.js')
const i18n = require('i18n')

const populateProjectId = async config => {
  const client = commonApi.getHttpClient(config)
  let proj = await createProjectId(config, client)
  if (proj === undefined) {
    proj = await getExistingProjectIdByName(config, client).then(res => {
      return res
    })

    return { projectId: proj, isNewProject: false }
  }

  return { projectId: proj, isNewProject: true }
}

const createProjectId = async (config, client) => {
  return client
    .createProjectId(config)
    .then(res => {
      if (res.statusCode === 409) {
        console.log(i18n.__('foundExistingProjectScan'))
        return
      }
      if (res.statusCode === 403) {
        console.log(i18n.__('permissionsError'))
        process.exit(1)
        return
      }
      if (res.statusCode === 429) {
        console.log(i18n.__('exceededFreeTier'))
        process.exit(1)
        return
      }
      if (res.statusCode === 201) {
        console.log(i18n.__('projectCreatedScan'))
        if (config.verbose) {
          console.log(i18n.__('populateProjectIdMessage', res.body.id))
        }
        return res.body.id
      }
    })
    .catch(err => {
      if (config.verbose) {
        console.log(err)
      }
      console.log(i18n.__('connectionError'))
      process.exit(0)
    })
}

const getExistingProjectIdByName = async (config, client) => {
  return client
    .getProjectIdByName(config)
    .then(res => {
      if (res.statusCode === 200) {
        if (config.verbose) {
          console.log(
            i18n.__('populateProjectIdMessage', res.body.content[0].id)
          )
        }
        return res.body.content[0].id
      }
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = {
  populateProjectId: populateProjectId
}
