import consul from 'consul';
// import { merge } from 'ramda'
// import uuid from 'uuid'

export default class Consul {
  constructor() {
    this.options = {
      host: 'consul',
      port: '8500',
      promisify: true
    }
    this.client = consul(options)
  }

  async set(id, value) {
    // TODO: spec key-value space schema
    await this.consul.kv.set(id, value)
  }

  async get(id) {
    // TODO: spec key-value space schema
    return await this.consul.kv.get(id)
  }
}
