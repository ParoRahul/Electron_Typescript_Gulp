/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDecorator } from '../instantiation'
import { ServiceCollection } from '../serviceCollection'
import { assert } from 'chai'
import 'mocha'

const IService1 = createDecorator<IService1>('service1')

interface IService1 {
	_serviceBrand: any;
	c: number;
}

class Service1 implements IService1 {
	_serviceBrand: any;
	c = 1;
}

const IService2 = createDecorator<IService2>('service2')

interface IService2 {
	_serviceBrand: any;
	d: boolean;
}

class Service2 implements IService2 {
	_serviceBrand: any;
	d = true;
}

describe('ServiceCollection Class ', () => {

	it('service collection, Instatiation', function () {
		const collection = new ServiceCollection([IService1, new Service1()])
		assert.isOk(collection.has(IService1))
		assert.isOk(collection.get(IService1))
    assert.instanceOf(collection.get(IService1) , Service1)
	})

  it('service collection, cannot overwrite', function () {
    const collection = new ServiceCollection()
		let result = collection.set(IService1, null)
    assert.equal(result, null)
    assert.deepEqual(result, undefined,'Collection item set to Null object')
		result = collection.set(IService1, new Service1())
		assert.deepEqual(result, null,'Collection item reset to valid object')
  })

  it('service collection, add/has', function () {
		const collection = new ServiceCollection()
		collection.set(IService1, null)
		assert.isOk(collection.has(IService1))
		collection.set(IService2, null)
		assert.isOk(collection.has(IService1))
		assert.isOk(collection.has(IService2))
  })

  it('service collection, get', function () {
		const collection = new ServiceCollection()
		collection.set(IService1, new Service1())
		assert.isOk(collection.has(IService1))
		collection.set(IService2, new Service2())
		assert.isOk(collection.get(IService1))
    assert.isOk(collection.get(IService2))
    assert.instanceOf(collection.get(IService1) , Service1)
    assert.instanceOf(collection.get(IService2) , Service2)
	})

})
