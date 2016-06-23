import 'source-map-support/register'
import assert from 'assert'
import log from 'amp-log-lib'
log.init({ name:'amp-consul-test' })

import { Consul } from '..'


function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

async function incr_unsafe(c, key) {
  const r = await c.get_json(key)
  await c.set_json(key, r + 1)
}

async function incr_safe(c, key) {
  await c.update_json(key, (r) => {
    return r + 1
  })
}

describe('amp-consul-lib', function() {
  let c = new Consul()
  const n = 10
  before(async () => {
    console.log ("starting...")
    let ok
    do {
      ok = false
      try {
        const h = await c.client.health.node('node1')
        console.log(h)
        ok = true
      } catch (e) {
        console.log("Error:", e.message)
      }
      if (!ok)
        await sleep(1000)
    } while (!ok)
  })

  it('should store and retrieve a value from consul', async function() {
    let result
    await c.set('hello', 'world')
    result = await c.get('hello')
    assert.equal(result.Value, 'world')
  })

  it('should store and retrieve a key value recursively from consul', async function() {
    let result
    await c.set('key1', 'val1')
    result = await c.get('key1')
    assert.equal(result.Value, 'val1')

    result = await c.set('key1/key2', 'val2')
    result = await c.get('key1/key2')
    assert.equal(result.Value, 'val2')

    result = await c.get({
      key: 'key1',
      recurse: true
    })
    assert.equal(result[0].Key, 'key1')
    assert.equal(result[0].Value, 'val1')
    assert.equal(result[1].Key, 'key1/key2')
    assert.equal(result[1].Value, 'val2')
  })

  it('should update consul entry (sync/unsafe) -> good', async function() {
    const key = 'key3'
    await c.set_json(key, 1)
    let v = await c.get_json(key)
    assert.equal(v, 1)

    for (let i = 0; i < n; i++) {
      await incr_unsafe(c, key)
    }

    v = await c.get_json(key)
    assert.equal(v, n + 1)
  })

  it('should update consul entry (async/unsafe) -> bad', async function() {
    const key = 'key4'
    await c.set_json(key, 1)
    let v = await c.get_json(key)
    assert.equal(v, 1)
    let all = []
    for (let i = 0; i < n; i++) {
      all.push(incr_unsafe(c, key))
    }
    await Promise.all(all)

    v = await c.get_json(key)
    assert.notEqual(v, n + 1)
  })

  it('should update consul entry (async/safe) -> good', async function() {
    const key = 'key4'
    await c.set_json(key, 1)
    let v = await c.get_json(key)
    assert.equal(v, 1)
    let all = []
    for (let i = 0; i < n; i++) {
      all.push(incr_safe(c, key))
    }
    await Promise.all(all)

    v = await c.get_json(key)
    assert.equal(v, n + 1)
  })
})
