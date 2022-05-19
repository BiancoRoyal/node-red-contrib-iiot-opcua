const fs = require('fs');
const path = require("path");

const read = async (outfilepath) => {
  const result =  new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, outfilepath || 'out.json'), 'utf8', function (err, data) {
        if (err) {
          reject(err);
          return
        }
        resolve(JSON.parse(data));
      });
    }
  );

  await result;

  if (result instanceof Error) {
    console.log('Error reading output file: ' + result.message);
    process.exit(1)
  }

  return result;
}

const write = async() => {
  const results = await read();

  const {
    numFailedTestSuites,
    numFailedTests,
    numPassedTestSuites,
    numPassedTests,
    success,
    testResults,
  } = results;

  if (!success){
    console.log('Jest failed');
    process.exit(1)
  }


  console.log('Overall Results');
  console.table({
    'Test Suite Completion': (numPassedTestSuites / numFailedTestSuites) + '(' + numPassedTestSuites + ' / ' + numFailedTestSuites + ')',
    'Test Completion': (numPassedTests / numFailedTests) + '(' + numPassedTests + ' / ' + numFailedTests + ')',
  })

  let detailedResults = {}
  testResults.forEach((singleResult) => {
    const name = singleResult.name.split('/test/')[1];
    detailedResults[name] = singleResult.status
  });

  console.log('Detailed Test Results');
  console.table(detailedResults);

}

write();