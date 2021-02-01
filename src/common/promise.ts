/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict'


import { Promise } from 'bluebird'

/* let p: Promise<Number> ; */

let k = new Promise<boolean>((res, rej)=> {
	try{
		let valid = true
		res(valid)
	} catch(e){
		rej(e)
	}
})

k.cancel()
