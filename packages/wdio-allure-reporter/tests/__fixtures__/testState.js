const testState = {
    type: 'test',
    start: '2018-05-14T15:17:18.914Z',
    _duration: 0,
    uid: 'should can do something3',
    cid: '0-0',
    title: 'should can do something',
    fullTitle: 'My awesome feature should can do something',
    state: 'pending',
    featureName: 'feature foo bar',
    scenarioName: 'story foo bar'
};

export function testStart(cid = '0-0') {
    return Object.assign(testState, {cid})
}

export function testPassed(cid = '0-0') {
    return Object.assign(testState, {cid, state: 'passed', end: '2018-05-14T15:17:21.631Z', _duration: 2730})
}

export function testFailed(cid = '0-0') {
    const error =
        {
            message: 'foo == bar',
            stack: 'AssertionError [ERR_ASSERTION]: foo == bar',
            type: 'AssertionError [ERR_ASSERTION]',
            name: 'AssertionError',
            expected: 'foo',
            actual: 'bar'
        }
    return Object.assign(testState, {cid, error, state: 'failed', end: '2018-05-14T15:17:21.631Z', _duration: 2730})
}

export function testPending(cid = '0-0') {
    return Object.assign(testState, {cid, state: 'pending', end: '2018-05-14T15:17:21.631Z', _duration: 0})
}
