import i18n from 'i18n'

export function commonHelpLinks() {
  return {
    header: i18n.__('commonHelpHeader'),
    content: [
      i18n.__('commonHelpCheckOutHeader') + i18n.__('commonHelpCheckOutText'),
      i18n.__('commonHelpLearnMoreHeader') + i18n.__('commonHelpLearnMoreText'),
      i18n.__('commonHelpJoinDiscussionHeader') +
        i18n.__('commonHelpJoinDiscussionText')
    ]
  }
}
