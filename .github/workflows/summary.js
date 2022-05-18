import * as core from '@actions/core';

await core.summary
    .addHeading('Test Results')
    .addTable([
        [{data: 'File', header: true}, {data: 'Result', header: true}],
        ['foo.js', 'Pass ✅'],
        ['bar.js', 'Fail ❌'],
        ['test.js', 'Pass ✅']
    ])
    .addLink('View staging deployment!', 'https://github.com')
    .write()