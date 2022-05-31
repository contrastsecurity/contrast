/**
 * The 'AnalysisEngine' type represents a simple state machine that can be used
 * to move through a list of steps sequentially to analyze a project. Consumers
 * construct their own steps and add them to the state machine in their desired
 * order. Upon completion the state machine can callback to the consumer that
 * originally invoked them with the results of the analysis.
 */
class AnalysisEngine {
  /**
   * Constructor that creates a new state machine instance. Accepts an optional
   * argument that initializes the internal state.
   *
   * @param {Object} initAnalysis - state used to initialize internal state
   *
   * @example
   * const ae = new AnalysisEngine()
   * const ae = new AnalysisEngine({ someInfo: [1, 2, 3] })
   */
  constructor(initAnalysis = {}) {
    this.analyzers = []
    this.analysis = { ...initAnalysis }
  }

  /**
   * Takes either a function or a list of functions and adds them in sequential
   * order to a list. The list will be executed at a later time as the steps of
   * the state machine.
   *
   * Functions must follow the signature (analysis, next) where:
   * 'analysis' is an object that represents the current internal state
   * 'next' is a function to be invoked when the step is complete
   *
   * The function signature of 'next' is (err) where:
   * 'err' is an Error that occurred during the previous step invoked
   *
   * @param {function(analysis: object, next: function)|function[]} analyzer -
   * the analyzer(s) to be added to the list of steps in sequential order
   *
   * @example
   * const myAnalyzer = (analysis, next) => {
   *   // Perform business logic
   *   // Add results to 'analysis'
   *   analysis.result = ...
   *
   *   // Signal the next analyzer/step to be invoked
   *   next()
   * }
   *
   * ae.use(myAnalyzer)
   */
  use(analyzer) {
    if (Array.isArray(analyzer)) {
      this.analyzers = [...this.analyzers, ...analyzer]
      return
    }

    this.analyzers.push(analyzer)
  }

  /**
   * Starts the execution of the state machine given the steps it is to use.
   * When complete it callbacks back to the consumer that invoked it. The
   * callbacks signature is (err, analysis) where:
   * 'err' is an Error from one of the steps that prevented completion
   * 'analysis' is the final internal state
   *
   * @param {function(err: Error, analysis: object)} callback - callback to be
   * invoked when state machine complete or fails prematurely
   * @param config:object containing config - needed for Java analysis - optional for other languages
   */
  analyze(callback, config) {
    let i = 0

    const next = err => {
      // If one of the analyzers encountered an error then callback
      if (err) {
        return setImmediate(() => callback(err, this.analysis))
      }

      // If there are no more analyzers to invoke then callback
      if (i >= this.analyzers.length) {
        return setImmediate(() => callback(null, this.analysis))
      }

      // Invoke the next analyzer
      const analyzer = this.analyzers[i]
      i++

      setImmediate(() => {
        // Protect ourselves from any uncaught errors thrown by analyzers
        try {
          analyzer(this.analysis, next, config)
        } catch (uncaughtErr) {
          next(uncaughtErr)
        }
      })
    }

    next()
  }
}

module.exports = exports = AnalysisEngine
