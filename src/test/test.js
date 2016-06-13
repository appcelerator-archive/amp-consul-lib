import 'babel-polyfill'
import 'source-map-support/register';
import assert from 'assert';
import { Consul } from '..';

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

describe('amp-consul-lib', function() {
  let c = new Consul()
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
})
