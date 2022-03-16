const fs = require('fs')
const path = require('path')
const Service = require('./Service')

class Builder {
  constructor() {
    this._name = ''
    this._version = '0.0.0'
    this._toolbox = {}
    this._on = {}
    this._routes = []
  }

  name(name) {
    this._name = name
    return this
  }

  version(version) {
    this._version = version
    return this
  }

  server(callback) {
    this._on.server = callback
    return this
  }

  router(callback) {
    this._on.router = callback
    return this
  }

  errors(callback) {
    this._on.errors = callback
    return this
  }

  toolbox(toolbox) {
    this._toolbox = toolbox
    return this
  }

  routes({ folder }) {
    // TODO: Move to 'fs-traversal' package.
    const visit_folder = (base, dirs, fn) => {
      const folder = path.resolve(base, ...dirs)
      fs.readdirSync(folder).forEach(file => {
        if (fs.statSync(`${folder}/${file}`).isDirectory()) return visit_folder(base, [ ...dirs, file ], fn)
        if (file.toLowerCase().endsWith('.js')) fn(base, dirs, folder, file, path.resolve(folder, file))
      })
    }

    // Register all routes.
    visit_folder(path.resolve(folder), [], (base, dirs, folder, file, filepath) => {
      this._routes.push(require(filepath))
    })

    return this
  }

  build() {
    return new Service({
      name: this._name,
      version: this._version, 
      toolbox: this._toolbox,
      routes: this._routes,
      on: this._on
    })
  }
}

module.exports = Builder
