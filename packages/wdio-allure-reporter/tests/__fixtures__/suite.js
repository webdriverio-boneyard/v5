const suite = {
    type: 'suite',
    start: '2018-05-14T15:17:18.914Z',
    _duration: 0,
    uid: 'A passing Suite2',
    cid: '0-0',
    title: 'A passing Suite',
    fullTitle: 'A passing Suite',
    tests: [],
    hooks: [],
    suites: []
};

export function suiteStart(cid= '0-0') {
    return Object.assign(suite, {cid})
}

export function suiteEnd(cid= '0-0') {
    return Object.assign(suite, {cid, end: '2018-05-14T15:17:21.631Z', _duration: 2730})
}

