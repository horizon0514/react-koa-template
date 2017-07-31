/* 
 * @From https://github.com/bugeats/eslint-pretty/blob/master/lib/api.js
 */
import { CLIEngine } from 'eslint'
import { join } from 'path'
const MAX_ESLINT_ITERATIONS = 5

const engine = new CLIEngine({
  useEslintrc: false,
  configFile: join(__dirname, 'eslint-config-airbnb.json'),
  fix: true,
})

function fixWithEslint(codeText) {
  let i = MAX_ESLINT_ITERATIONS
  let fixedCodeText = codeText
  let report
  while (i) {
    report = engine.executeOnText(fixedCodeText)
    if (report && report.results && report.results[0] && report.results[0].output) {
      fixedCodeText = report.results[0].output
    } else {
      break
    }
    i--
  }
  return fixedCodeText
}

export default (code) => fixWithEslint(code)

