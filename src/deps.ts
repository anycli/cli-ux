export const deps = {
  get stripAnsi(): typeof import ('strip-ansi') { return fetch('strip-ansi') },
  get ansiStyles(): typeof import ('ansi-styles') { return fetch('ansi-styles') },
  get ansiEscapes(): any { return fetch('ansi-escapes') },
  get passwordPrompt(): any { return fetch('password-prompt') },
  get screen(): typeof import ('@oclif/screen') { return fetch('@oclif/screen') },

  get open(): typeof import ('./open').default { return fetch('./open').default },
  get prompt(): typeof import ('./prompt').default { return fetch('./prompt').default },
  get styledObject(): typeof import ('./styled/object').default { return fetch('./styled/object').default },
  get styledHeader(): typeof import ('./styled/header').default { return fetch('./styled/header').default },
  get styledJSON(): typeof import ('./styled/json').default { return fetch('./styled/json').default },
  get table(): typeof import ('./styled/table').default { return fetch('./styled/table').default },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
