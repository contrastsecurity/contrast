module.exports = exports = ({ java }, next) => {
  // Remove anything sensitive or unnecessary from being sent to the backend as
  // a result of our Java project analysis
  delete java.mvnDependancyTreeOutput
  next()
}
