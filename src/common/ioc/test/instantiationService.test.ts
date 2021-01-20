/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

import { SyncDescriptor } from '../descriptors'
import { createDecorator, optional, IServicesAccessor } from '../instantiation'
import { InstantiationService } from '../instantiationService'
import { ServiceCollection } from '../serviceCollection'
import { assert } from 'chai'
import 'mocha'

const IService1 = createDecorator<IService1>('service1')

interface IService1 {
	_serviceBrand: string;
	c: number;
}

class Service1 implements IService1 {
	_serviceBrand= 'Service1';
	c = 1;
}

const IService2 = createDecorator<IService2>('service2')

interface IService2 {
	_serviceBrand: any;
	d: boolean;
}

class Service2 implements IService2 {
	_serviceBrand= 'Service2';
	d = true;
}

const IService3 = createDecorator<IService3>('service3')

interface IService3 {
	_serviceBrand: any;
	s: string;
}

class Service3 implements IService3 {
	_serviceBrand = 'Service3';
	s = 'foo';
}

const IDependentService = createDecorator<IDependentService>('dependentService')

interface IDependentService {
	_serviceBrand: any;
	name: string;
}

class DependentService implements IDependentService {
	_serviceBrand = 'DependentService';
	name = 'foobar';
	constructor( @IService1 service: IService1) {
		assert.equal(service.c, 1)
	}

}

class Service1Consumer {

	constructor( @IService1 private readonly service1: IService1) {
		assert.ok(service1)
		assert.equal(service1.c, 1)
	}

	check(): number {
		return this.service1.c
	}
}

class Target2Dep {

	constructor( @IService1 service1: IService1, @IService2 service2: any) {
		assert.ok(service1 instanceof Service1)
		assert.ok(service2 instanceof Service2)
	}
}

interface IConfig {
	x: number;
	z: string;
}

class TargetWithStaticParam {
	constructor(private readonly v: boolean,
							private readonly s: string,
							private readonly num: Number,
							private readonly config: IConfig,
							@IService1 private readonly service1: IService1,
							@IService2 private readonly service2: IService2) {
		assert.ok(v)
		assert.ok(service1)
		assert.equal(service1.c, 1)
	}
	get boolValue(){ return this.v}
	get stringValue() { return this.s}
	get numValue() { return this.num}

	get Config(): IConfig { return this.config}

	get SerVice1Parameter(): number { return this.service1.c }

	get SerVice2Parameter(): boolean { return this.service2.d }

}

class TargetNotOptional {
	constructor( @IService1 service1: IService1, @IService2 service2: IService2) {

	}
}

class TargetOptional {
	constructor( @IService1 service1: IService1, @optional(IService2) service2: IService2) {
		assert.ok(service1)
		assert.equal(service1.c, 1)
		assert.ok(service2 === void 0)
	}
}

class DependentServiceTarget {
	constructor( @IDependentService d: any) {
		assert.ok(d)
		assert.equal(d.name, 'foobar')
	}
}

class DependentServiceTarget2 {
	constructor( @IDependentService d: IDependentService, @IService1 s: IService1) {
		assert.ok(d)
		assert.equal(d.name, 'foobar')
		assert.ok(s)
		assert.equal(s.c, 1)
	}
}

describe('Instantiation Service ', () => {

	it('@Param - createInstance with no dependency', function () {
    const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new Service1())
		collection.set(IService2, new Service2())
		collection.set(IService3, new Service3())

		const s1 = service.createInstance(Service1)
		const s2 = service.createInstance(Service2)
		const s3 = service.createInstance(Service3)
		assert.instanceOf(s1,Service1)
		assert.instanceOf(s2,Service2)
		assert.instanceOf(s3,Service3)
		assert.equal(s1.c,1)
		assert.equal(s2.d,true)
		assert.equal(s3.s,'foo')
	})

  it('@Param - simple clase', function () {
    const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new Service1())
		collection.set(IService2, new Service2())
		collection.set(IService3, new Service3())

    const consumer = service.createInstance(Service1Consumer)
    assert.isOk(consumer)
		assert.instanceOf(consumer,Service1Consumer)
		assert.equal(consumer.check(), 1)
	})

	it('@Param - fixed args', function () {
		const collection = new ServiceCollection()

		collection.set(IService1, new Service1())
		collection.set(IService2, new Service2())
		collection.set(IService3, new Service3())

		const service = new InstantiationService(collection, true)

		const targetWithStaticParam = service.createInstance(TargetWithStaticParam, true, 'hellow World', -3.145, {x: 7, z: 'testing'})
		assert.isDefined(targetWithStaticParam)
		assert.isNotNull(targetWithStaticParam)
		assert.instanceOf(targetWithStaticParam, TargetWithStaticParam)
		//assert.isTrue(targetWithStaticParam.boolValue)
		assert.equal(targetWithStaticParam.stringValue, 'hellow World')
		assert.equal(targetWithStaticParam.numValue, -3.145)
		assert.deepEqual(targetWithStaticParam.Config, {x: 7, z: 'testing'})

		assert.deepEqual(targetWithStaticParam.SerVice1Parameter,1)
		assert.deepEqual(targetWithStaticParam.SerVice2Parameter,true)
	})



	it('@Param - optional', function () {
		const collection = new ServiceCollection([IService1, new Service1()])
		let service = new InstantiationService(collection, true)

		service.createInstance(TargetOptional)
		assert.throws(() => service.createInstance(TargetNotOptional))

		service = new InstantiationService(collection, false)
		service.createInstance(TargetOptional)
		service.createInstance(TargetNotOptional)
	})


	it('service collection is live', function () {

		const collection = new ServiceCollection()
		collection.set(IService1, new Service1())

		const service = new InstantiationService(collection)
		service.createInstance(Service1Consumer)

		// no IService2
		assert.throws(() => service.createInstance(Target2Dep))
		service.invokeFunction(function (a) {
			assert.ok(a.get(IService1))
			assert.ok(!a.get(IService2, optional))
		})

		collection.set(IService2, new Service2())

		const t2= service.createInstance(Target2Dep)
		assert.instanceOf(t2,Target2Dep)
		service.invokeFunction(function (a) {
			assert.ok(a.get(IService1))
			assert.ok(a.get(IService2))
		})
	})

	it('SyncDesc - no dependencies', function () {
		const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new SyncDescriptor<IService1>(Service1))
		service.invokeFunction(accessor => {
			const service1 = accessor.get(IService1)
			assert.ok(service1)
			assert.equal(service1.c, 1)
			const service2 = accessor.get(IService1)
			assert.ok(service1 === service2)
		})
	})

	it('SyncDesc - service with service dependency', function () {
		const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new SyncDescriptor<IService1>(Service1))
		collection.set(IDependentService, new SyncDescriptor<IDependentService>(DependentService))

		service.invokeFunction(accessor => {
			const d = accessor.get(IDependentService)
			assert.ok(d)
			assert.equal(d.name, 'foobar')
		})
	})

	it('SyncDesc - target depends on service future', function () {
		const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new SyncDescriptor<IService1>(Service1))
		collection.set(IDependentService, new SyncDescriptor<IDependentService>(DependentService))

		const d = service.createInstance(DependentServiceTarget)
		assert.ok(d instanceof DependentServiceTarget)

		const d2 = service.createInstance(DependentServiceTarget2)
		assert.ok(d2 instanceof DependentServiceTarget2)
	})

	it('Invoke - get services', function () {
		const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new Service1())
		collection.set(IService2, new Service2())

		function test(accessor: IServicesAccessor) {
			assert.ok(accessor.get(IService1) instanceof Service1)
			assert.equal(accessor.get(IService1).c, 1)

			return true
		}
		assert.equal(service.invokeFunction(test), true)
	})

	it('Invoke - get service, optional', function () {
		const service = new InstantiationService(new ServiceCollection([IService1, new Service1()]))

		function test(accessor: IServicesAccessor) {
			assert.ok(accessor.get(IService1) instanceof Service1)
			assert.throws(() => accessor.get(IService2))
			assert.equal(accessor.get(IService2, optional), undefined)
			return true
		}
		assert.equal(service.invokeFunction(test), true)
	})

	it('Invoke - keeping accessor NOT allowed', function () {
		const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new Service1())
		collection.set(IService2, new Service2())

		let cached: IServicesAccessor

		function test(accessor: IServicesAccessor) {
			assert.ok(accessor.get(IService1) instanceof Service1)
			assert.equal(accessor.get(IService1).c, 1)
			cached = accessor
			return true
		}

		assert.equal(service.invokeFunction(test), true)

		assert.throws(() => cached.get(IService2))
	})

	it('Invoke - throw error', function () {
		const collection = new ServiceCollection()
		const service = new InstantiationService(collection)
		collection.set(IService1, new Service1())
		collection.set(IService2, new Service2())

		function test(accessor: IServicesAccessor) {
			throw new Error()
		}

		assert.throws(() => service.invokeFunction(test))
	})

})