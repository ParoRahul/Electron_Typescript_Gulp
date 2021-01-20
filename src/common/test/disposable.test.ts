/* eslint-disable @typescript-eslint/no-empty-function */
'use strict'

import { IDisposable, isDisposable, toDisposable, dispose, Disposable} from '../disposable'
import { assert } from 'chai'
import 'mocha'

describe('Disposable Objects ', () => {
  class Object1 implements IDisposable{
    isDisposed = false;
    dispose() { this.isDisposed = true }
  }

  class Object2 implements IDisposable{
    private _toDispose: IDisposable[]
    isDisposed = false;
    constructor(private id: string){
      this._toDispose = []
    }
    dispose(){
      dispose(this._toDispose)
      this.isDisposed = true
    }
  }

  class NonDisposable {
    private _notToDispose: number[]
    constructor(private id: string){
      this._notToDispose = []
    }
  }

  const object1 = new Object1()
  const object2 = new Object2('OBJECT2')

  it('isDisposable: Class implements IDisposable should be isDisposable', function () {
    assert.isTrue(isDisposable(object1))
    assert.isTrue(isDisposable(object2))
    const nonDisposable = new NonDisposable('non-disposable')
    assert.isFalse(isDisposable(nonDisposable), 'NonDisposable not implements nor extends IDisposible/Disposible')
  })

  it('toDisposable: convert ()=> {}  Objects to Disposable object', function () {
    const noopFunc1 = function(){
      console.log(' This is NOOOP function')
    }
    const noopFunc2 = function(){
      console.log(' This is NOOOP function')
    }
    assert.isFalse(isDisposable(noopFunc1), 'noopFunc1 is not Disposable')
    assert.isFalse(isDisposable(noopFunc2), 'noopFunc2 is not Disposable')
    const disposile1 = toDisposable(noopFunc1)
    const disposile2 = toDisposable(noopFunc2)
    assert.isTrue(isDisposable(disposile1), 'toDisposable(noopFunc1) is  Disposable')
    assert.isTrue(isDisposable(disposile2), 'toDisposable(noopFunc2) is  Disposable')
  })

  it('disposable: 1.dispose array of Disposable object', function () {
    const disposableArray = [object1, object2, new Object1(), new Object2('item')]
    disposableArray.forEach((item, index)=> {
      assert.isFalse(item.isDisposed, `${index} th object disposed from beggining`)
    })
    dispose(disposableArray)
    disposableArray.forEach((item, index)=> {
      assert.isTrue(item.isDisposed,`${index} th object disposed Sucessfully`)
    })
  })

  it('disposable: 2.dispose array of Disposable object', function () {
    const array = [{ dispose() { } }, { dispose() { } }]
		const array2 = dispose(array)

		assert.equal(array.length, 2)
		assert.equal(array2.length, 0)
		assert.ok(array !== array2)
  })

})

describe('Disposable Class ', () => {

  it('Dispose Disposible class objects using dispose func',()=>{
    class Disposable1 extends Disposable{
      isDisposed = false;
      dispose() {
        this.isDisposed = true
        super.dispose()
      }
    }
    const disposible1 = new Disposable1()
    assert.equal(disposible1.isDisposed, false, 'item should not be disposed at initiation')
    dispose(disposible1)
    assert.equal(disposible1.isDisposed, true, 'item should be disposed after dispose call')
  })


})