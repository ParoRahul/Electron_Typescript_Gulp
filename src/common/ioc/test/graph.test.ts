import { Graph } from '../graph'
import { assert } from 'chai'
import 'mocha'

describe('Graph  Objects ', () => {
  let graph: Graph<string>
  beforeEach(() => {
      graph = new Graph<string>(s => s)
  })

  it('is possible to lookup nodes that don\'t exist', function () {
		assert.deepEqual(graph.lookup('ddd'), undefined)
  })

  it('inserts nodes when not there yet', function () {
		assert.deepEqual(graph.lookup('ddd'), undefined)
		assert.deepEqual(graph.lookupOrInsertNode('ddd').data, 'ddd')
		assert.deepEqual(graph.lookup('ddd')!.data, 'ddd')
  })

  it('can remove nodes and get length', function () {
		assert.isTrue(graph.isEmpty())
		assert.deepEqual(graph.lookup('ddd'), undefined)
		assert.deepEqual(graph.lookupOrInsertNode('ddd').data, 'ddd')
		assert.isFalse(graph.isEmpty())
		graph.removeNode('ddd')
		assert.deepEqual(graph.lookup('ddd'), undefined)
		assert.isTrue(graph.isEmpty())
  })

  it('root : Create Loop', () => {
		graph.insertEdge('1', '2')
		let roots = graph.roots()
		assert.equal(roots.length, 1)
		assert.equal(roots[0].data, '2')

		graph.insertEdge('2', '1')
		roots = graph.roots()
		assert.equal(roots.length, 0)
  })

  it('root complex', function () {
		graph.insertEdge('1', '2')
		graph.insertEdge('1', '3')
		graph.insertEdge('3', '4')

		const roots = graph.roots()
		assert.equal(roots.length, 2)
		assert(['2', '4'].every(n => roots.some(node => node.data === n)))
	})

})