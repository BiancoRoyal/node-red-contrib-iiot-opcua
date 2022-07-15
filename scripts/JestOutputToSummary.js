const fs = require('fs')
const path = require('path')

const read = async (outfilepath) => {
  const result = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, outfilepath || 'out.json'), 'utf8', function (err, data) {
      if (err) {
        reject(err)
        return
      }
      resolve(JSON.parse(data))
    })
  }
  )

  await result

  if (result instanceof Error) {
    console.log('Error reading output file: ' + result.message)
    process.exit(1)
  }

  return result
}

const write = async () => {
  const results = await read()

  const {
    numTotalTestSuites,
    numTotalTests,
    numPassedTestSuites,
    numPassedTests,
    success,
    testResults
  } = results

  if (!success) {
    console.log('Jest failed')
    process.exit(1)
  }

  writeMarkdown({
    'Test Suite Completion': (numPassedTestSuites / numTotalTestSuites * 100) + '% (' + numPassedTestSuites + ' / ' + numTotalTestSuites + ')',
    'Test Completion': (numPassedTests / numTotalTests * 100) + '% (' + numPassedTests + ' / ' + numTotalTests + ')'
  }, 'Overall Results', ['Measure', 'Status'])

  const detailedResults = {}
  testResults.forEach((singleResult) => {
    const name = singleResult.name.split('/test/')[1]
    detailedResults[name] = singleResult.status
  })

  writeMarkdown(detailedResults, 'Detailed Results  ', ['Test', 'Status'])
}

const writeMarkdown = (obj, title, columns) => {
  if (title) console.log('### ' + title)

  const entries = (typeof obj[Object.keys(obj)[0]] === 'string' ? 1 : obj[Object.keys(obj)[0]].length || 1) + 1

  const header = [...Array(entries)].map((item, index) => {
    if (index <= columns.length) {
      return columns[index]
    } else {
      return ' '
    }
  })
  const seperator = [...Array(entries)].map((item) => ':---:')

  console.log()
  writeRow(header)
  writeRow(seperator)

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] !== 'string' && obj[key].length) {
      writeRow(key + obj[key])
    } else {
      writeRow([key, obj[key]])
    }
  })
  console.log()
}

const writeRow = (array) => {
  const output = array.join(' | ')
  console.log('| ' + output + ' |   ')
}

write()
