import 'source-map-support/register';
import assert from 'assert';
import consul from '..';

describe('amp-consul-lib', function() {
  let c = consul()

  it('should store and retrive a value from consul', async function() {
    let result = await c.kv.set('hello', 'world')
    assert.equal(result, true)
    result = await c.kv.get('hello')
    assert.equal(result.Key, 'hello')
    assert.equal(result.Value, 'world')
  })

  it('should store and retrive a key value recursively from consul', async function() {
    let result = await c.kv.set('key1', 'val1')
    assert.equal(result, true)
    result = await c.kv.get('key1')
    assert.equal(result.Key, 'key1')
    assert.equal(result.Value, 'val1')

    result = await c.kv.set('key1/key2', 'val2')
    assert.equal(result, true)
    result = await c.kv.get('key1/key2')
    assert.equal(result.Key, 'key1/key2')

    result = await c.kv.get({
      key: 'key1',
      recurse: true
    })
    assert.equal(result[0].Key, 'key1')
    assert.equal(result[0].Value, 'val1')
    assert.equal(result[1].Key, 'key1/key2')
    assert.equal(result[1].Value, 'val2')
  })
})
