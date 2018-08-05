const command = {
    method: 'GET',
    endpoint: '/session/:sessionId/element',
    body: {using: 'css selector', value: 'img'},
    result: { value: { x: 75, y: 11, width: 160, height: 160 } },
    cid: '0-0',
    sessionId: '4d1707ae-820f-1645-8485-5a820b2a40da',
    capabilities: [Object]
}

export function commandStart() {
    return command
}

export function commandEnd() {
    return command
}
