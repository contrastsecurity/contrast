module.exports = exports = ({ go }, next) => {
  // Remove anything sensitive or unnecessary from being sent to the backend as
  // a result of our Go project analysis
  delete go.modGraphOutput

  next()
}
