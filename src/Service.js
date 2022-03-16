const express = require('express')

class Service {
  constructor({ name, version, toolbox, routes, on }) {
    this.name = name
    this.version = version
    this.toolbox = toolbox
    this.routes = routes
    this.on = on
  }

  run(port) {
    // Create Express server and remove built-in Express headers.
    this.server = express()
    this.server.disable('x-powered-by')

    // Allow the service to customize the Express server.
    if (this.on.server) this.on.server(this.server)

    // Create a router.
    this.router = express.Router()
    this.server.use('/', this.router)

    // Allow the service to customize the router.
    if (this.on.router) this.on.router(this.router, this.server)

    // Convenience for handling errors thrown from route controllers.
    const handle_errors = (toolbox, callback) => {
      return async (req, res, next) => {
        try {
          await callback(toolbox, req, res, next)
        } catch (error) {
          // Allow the service to customize error handling.
          if (this.on.errors) this.on.errors(res, error)
          else throw error
        }
      }
    }

    // Configure routes.
    this.routes.forEach(route => {
      this.router[route.method](route.path, handle_errors(this.toolbox, route.handler))
    })

    // Run HTTP server.
    this.server.listen(port, () => {
      console.log(`${this.name} v${this.version} running on port ${port}`)
    })
  }
}

module.exports = Service
