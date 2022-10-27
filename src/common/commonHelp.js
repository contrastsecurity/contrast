const i18n = require('i18n')
const chalk = require('chalk')

const commonHelpLinks = () => {
  return [
    {
      header: i18n.__('commonHelpHeader'),
      content: [
        i18n.__('commonHelpCheckOutHeader') + i18n.__('commonHelpCheckOutText'),
        i18n.__('commonHelpLearnMoreHeader') +
          i18n.__('commonHelpLearnMoreText'),
        i18n.__('commonHelpJoinDiscussionHeader') +
          i18n.__('commonHelpJoinDiscussionText')
      ]
    },
    {
      header: i18n.__('commonHelpEnterpriseHeader'),
      content: [
        i18n.__('commonHelpLearnMoreEnterpriseHeader') +
          i18n.__('commonHelpLearnMoreEnterpriseText')
      ]
    }
  ]
}

const postRunMessage = commandName => {
  console.log('\n' + chalk.underline.bold('Other Features:'))
  if (commandName !== 'scan')
    console.log(
      "'contrast scan' to run Contrasts’ industry leading SAST scanner"
    )
  if (commandName !== 'audit')
    console.log(
      "'contrast audit' to find vulnerabilities in your open source dependencies"
    )
  if (commandName !== 'lambda')
    console.log("'contrast lambda' to secure your AWS serverless functions")
}

module.exports = {
  commonHelpLinks,
  postRunMessage
}
