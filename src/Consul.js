import consul from 'consul';

const host = process.env.CONSUL ? procecess.env.CONSUL.split(':')[0] : 'consul';

export default class Consul {
  constructor() {
    this.options = {
      host,
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
