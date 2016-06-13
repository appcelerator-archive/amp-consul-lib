import consul from 'consul'
import log from 'amp-log-lib'

let consul_update = 0
let consul_conflict = 0
let consul_conflict_freq = []

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

  // update : allow concurrent update of an object using advisory consul test-and-set strategy
  async update(key, f) {
    consul_update += 1
    let is_updated
    let val2
    let retry = 0
    do {
      const result = await this.client.kv.get(key)
      let val = null
      let cas = 0
      if (result) {
        val = JSON.parse(result.Value);
        cas = result.ModifyIndex
      }
      val2 = f(val, key)
      if (!val2)
        break

      is_updated = await this.client.kv.set({ key, value: JSON.stringify(val2), cas });

      if (!is_updated) {
        consul_conflict += 1
        retry += 1
        log.info({ msgid: "consul conflict", consul_update, consul_conflict, consul_conflict_freq, key })
        //TODO: add exponential random delay before retry
      } else {
        consul_conflict_freq[retry] = consul_conflict_freq[retry] || 0
        consul_conflict_freq[retry] += 1
      }
    } while (!is_updated)
    return val2
  }
}
