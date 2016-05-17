# amp-consul-lib

The amp-consul-lib microservice has been generated with a few basic sample routes and async mocha test.

## Features:

  * Docker support for production and development, including debugging support with [Node Inspector](https://github.com/node-inspector/node-inspector)
  * Signal handling for graceful server shutdown (including inside of Docker containers)
  * [Babel](https://babeljs.io) support
  * [ESLint](http://eslint.org/) / [esformatter](https://github.com/millermedeiros/esformatter) support

  ## Details

  The [Atomiq CLI](https://github.com/atomiqio/atomiq-cli) provides the following commands for building, running, and testing this project with Docker.

  #### atomiq make

  The `atomiq make` group of commands make changes to the file system. Run `atomiq make --help` or `atomiq make [cmd] --help` for help at the command line.

   * `atomiq make clean` - remove project build artifacts (`dist` directory)
   * `atomiq make dist` - ensure all files are copied from `src` to `dist`
   * `node make babel` - transpile `src` to `dist` with sourcemaps (ES6 and async/await support)
   * `node make build` - build the Docker image for the project
   * `node make rebuild` - force build fresh Docker image for the project
   * `node make watch-src` - watch `src` directory and update `dist`
   * `node make watch-dist` - watch `dist` directory and restart server

  #### atomiq

   * `atomiq new` - create a new atomiq project (`api`, `app`, or `lib`)
   * `atomiq up` - run `api` or `app` project in a container
   * `atomiq test` - run project tests in a container
   * `atomiq debug` - debug `api` or `app` project in a container
   * `atomiq url` - get URL (IP:PORT) for running `api` or `app`

  ### Developing

  terminal #1

      $ atomiq make build

      # watch for changes in src and update dist
      $ node make watch-src

  terminal #2

      # watch for changes in dist and restart server
      $ node make watch-dist

  terminal #3

      url=$(atomiq url)

      $ curl $url/item/ping

      $ curl -X POST -H "Content-Type: application/json" -d '{"key1":"value1", "key2":"value2"}' $url/item/1

      $ # easier POST with curl default (application/x-www-form-urlencoded):
      $ curl -X POST -d "param1=value1&param2=value2" $url/item/1

      $ # or post with data file
      $ curl -d "@data.json" -X POST $url/item/1

  ### Testing

      $ atomiq test

  ### Debugging

      $ atomiq debug

  Open node inspector in browser

  local:

      $ open http://192.168.99.100:8080/?ws=192.168.99.100:8080&port=5858

  container:

     $ IP=$(docker-machine ip <machine>)
     $ open http://$IP:8080/?ws=$IP:8080&port=5858

  ### Routing

  Routes are ES6 modules that export a default class.

  If you decide to add a constructor to your class, make sure to call super(app):

      default export class MyRoute extends Route {
        constructor(app) {
          super(app);

          // you have access to the app and the express router for this route
          this.app ...
          this.router ...
        }
      }

  All [Express/HTTP methods](http://expressjs.com/en/4x/api.html#app.METHOD) are supported. Any method matching a verb name is automatically
  added to the router for `this` route. If you need to use an HTTP verb that is not a
  valid JavaScript name (there is only one: 'm-search'), you will need to attach it to `this.router` in the constructor:

      this.router['m-search'](req, res) {
        ...
      }

