/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'

import * as array from '../array'
import { assert } from 'chai'
import 'mocha'

describe('Array utility ', () => {
  let numArray: number[]
  let boolArray: boolean[]
  let stringArray: string[]
  let objectArray: ITestObject[]
  interface ITestObject{
    id: number,
    name: string,
    married: boolean
  }


  beforeEach(() => {
    numArray = [1,3,56,78,34,23,634,78,56,35456,657,566757,98]
    boolArray = [true, true, false, true, false, true, false, true, false, true]
    stringArray= [ 'HI', 'Rahul', ',', 'This', 'is', 'String', 'Array', 'noe', 'test', 'it']
    objectArray = [ {id: 1, name: 'hfkhs', married: true}, {id: 2, name: 'sdfsfsfg', married: true},
                    {id: 6, name: 'Rahul', married: true}, {id: 7, name: 'sfdfggg', married: false} ]
	})

  it('array.tail function should return valid item', function () {
    assert.equal(array.tail(numArray), 98, 'testing with number')
    assert.equal(array.tail(boolArray), true, 'testing with boolean')
    assert.equal(array.tail(stringArray), 'it', 'testing with string')
    assert.deepEqual(array.tail(objectArray),{id: 7, name: 'sfdfggg', married: false}, 'testing with object')
  })

  it('array.tail function with inrex, should return valid item', function () {
    assert.equal(array.tail(numArray,3), 35456, 'testing with number')
    assert.equal(array.tail(boolArray,5), false, 'testing with boolean')
    assert.equal(array.tail(stringArray,3), 'Array', 'testing with string')
    assert.deepEqual(array.tail(objectArray,2),{id: 2, name: 'sdfsfsfg', married: true}, 'testing with object')
  })

  it('array.equals with numbers type, should return true when 2 arrays are same ', function () {
    const sameNumArray =  new Array(...numArray)
    assert.equal(array.equals(numArray,sameNumArray), true )
    sameNumArray.pop()
    assert.notEqual(array.equals(numArray,sameNumArray), true, 'second array popped' )
    numArray.pop()
    numArray[4] = 37
    assert.notEqual(array.equals(numArray,sameNumArray), true, 'First array popped' )
  })

  it('array.equals with boolean type, should return true when 2 arrays are same ', function () {
    const copiedBoolArray = new Array(...boolArray)
    assert.notEqual(array.equals(boolArray,copiedBoolArray), false )
    copiedBoolArray.push(true)
    assert.notEqual(array.equals(boolArray,copiedBoolArray), true, 'second array popped' )
    boolArray.push(true)
    boolArray[4] = true
    assert.notEqual(array.equals(boolArray,copiedBoolArray), true, 'First array popped' )
  })

  it('array.equals with string type, should return true when 2 arrays are same ', function () {
    const copiedStringArray = new Array(...stringArray)
    assert.notEqual(array.equals(stringArray,copiedStringArray), false )
    copiedStringArray.splice(2,2)
    assert.notEqual(array.equals(stringArray,copiedStringArray), true, 'second array splice' )
    stringArray.splice(2,2)
    assert.equal(array.equals(stringArray,copiedStringArray), true, 'First array splice' )
    stringArray[4] = 'true'
    assert.equal(array.equals(stringArray,copiedStringArray), false, 'First array modified' )
  })

  it('array.equals with Object type, should return true when both the arrays are same ', function () {
    const copiedObjectArray = new Array(...objectArray)
    assert.equal(array.equals(objectArray,copiedObjectArray), true, 'copied object array is same as original' )
    copiedObjectArray.push({id: 8, name: 'ranii', married: true})
    assert.notEqual(array.equals(objectArray,copiedObjectArray), true, 'object literal added 2 second array' )
    objectArray.push({id: 8, name: 'ranii', married: true})
    assert.equal(array.equals(objectArray,copiedObjectArray), false, 'same object literal added 2 first array too' )
    objectArray.pop()
    objectArray.push(copiedObjectArray[copiedObjectArray.length -1])
    assert.equal(array.equals(objectArray,copiedObjectArray), true, 'copied object array is same as original' )
  })

  it('array.coalesce , should clean the array ', function () {
    const anyArry: any[] =  new Array(...numArray)
    anyArry.push(undefined)
    anyArry.push(null)
    assert.deepEqual(array.coalesce(numArray),numArray,'number array was cleaned')
    assert.deepEqual(array.coalesce(anyArry),numArray,'anyArry is cleaned after darty1')
    anyArry.splice(2,0, null)
    anyArry.splice(4,0, null)
    assert.deepEqual(array.coalesce(anyArry),numArray,'anyArry is cleaned after datry2')
    anyArry.splice(2,0, undefined)
    anyArry.splice(4,2, null)
    array.coalesce(anyArry).forEach( (item)=> assert.isNotNull(item) )
	})


})