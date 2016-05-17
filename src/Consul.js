import consul from 'consul';

export default class Consul {
  constructor() {
    this.options = {
      host: 'consul',
      port: '8500',
      promisify: true
    }
    this.client = consul(this.options)
  }

  async set(id, value) {
    await this.client.kv.set(id, value)
  }

  async get(id) {
    return await this.client.kv.get(id)
  }

  async delete(id) {
    return await this.client.kv.del(id)
  }
}
