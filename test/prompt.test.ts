import cli from '../src'

import {expect, fancy} from './fancy'

describe('prompt', () => {
  fancy
  .stdout()
  .stderr()
  .end('requires input', async () => {
    const promptPromise = cli.prompt('Require input?')
    process.stdin.emit('data', '')
    process.stdin.emit('data', 'answer')
    const answer = await promptPromise
    await cli.done()
    expect(answer).to.equal('answer')
  })

  fancy
  .stdout()
  .stderr()
  .end('does not require input', async () => {
      const promptPromise = cli.prompt('Require input?', {
        required: false
      })
      process.stdin.emit('data', '')
      const answer = await promptPromise
      await cli.done()
      expect(answer).to.equal(undefined)
  })

  fancy
  .stdout()
  .stderr()
  .end('timeouts with no input', async () => {
    const response = await cli.prompt('Require input?', {timeout: 100})
    expect(response).to.not.exist
  })
})
