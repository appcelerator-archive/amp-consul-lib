import 'babel-polyfill'
import 'source-map-support/register';
import assert from 'assert';
import { Consul } from '..';

describe('amp-consul-lib', function() {
  const options = {
    host: 'consul',
    port: '8500',
    promisify: true
  }
  let c = new Consul()

  it('should store and retrive a value from consul', async function() {
    let result = await c.set('hello', 'world')
    assert.equal(result, true)
    result = await c.get('hello')
    assert.equal(result.Key, 'hello')
    assert.equal(result.Value, 'world')
  })

  it('should store and retrive a key value recursively from consul', async function() {
    let result = await c.set('key1', 'val1')
    assert.equal(result, true)
    result = await c.get('key1')
    assert.equal(result.Key, 'key1')
    assert.equal(result.Value, 'val1')

    result = await c.set('key1/key2', 'val2')
    assert.equal(result, true)
    result = await c.get('key1/key2')
    assert.equal(result.Key, 'key1/key2')

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
