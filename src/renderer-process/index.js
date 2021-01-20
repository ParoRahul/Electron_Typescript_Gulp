/* eslint-disable no-var */
'use strict'

var nodePath = require('path')
//var nodeUrl = require('url')

function parseURLQueryArgs() {
	const search = window.location.search || ''
	return search.split(/[?&]/)
		.filter(function (param) { return !!param })
		.map(function (param) { return param.split('=') })
		.filter(function (param) { return param.length === 2 })
		.reduce(function (r, param) { r[param[0]] = decodeURIComponent(param[1]); return r }, {})
}

function onUnexpectedError(error, enableDevTools) {
	const { ipcRenderer } = require('electron')
	if (enableDevTools) {
		ipcRenderer.send('myapp:openDevTools')
	}
	console.error('[uncaught exception]: ' + error)
	if (error.stack) {
		console.error(error.stack)
	}
}

function uriFromPath(_path) {
	let pathName = nodePath.resolve(_path).replace(/\\/g, '/')
	if (pathName.length > 0 && pathName.charAt(0) !== '/') {
		pathName = '/' + pathName
	}
	return encodeURI('file://' + pathName)
}

function registerListeners(enableDevTools, windowId ) {
		const { ipcRenderer } = require('electron')
		// let listener: (event: KeyboardEvent) => void
		let listener
		const toggleDevToolsKb = (process.platform === 'darwin' ? 'meta-alt-73' : 'ctrl-shift-73') // mac: Cmd-Alt-I, rest: Ctrl-Shift-I
		const reloadKb = (process.platform === 'darwin' ? 'meta-82' : 'ctrl-82') // mac: Cmd-R, rest: Ctrl-R
		if (enableDevTools) {
			const extractKey = function(event) {
				return [
					event.ctrlKey ? 'ctrl-' : '',
					event.metaKey ? 'meta-' : '',
					event.altKey ? 'alt-' : '',
					event.shiftKey ? 'shift-' : '',
					event.key
				].join('')
			}
			listener = function (event) {
					const key = extractKey(event)
					if (key === toggleDevToolsKb) {
							ipcRenderer.send('myapp:toggleDevTools', windowId)
					} else if (key === reloadKb) {
							const scripts = document.getElementsByTagName('script')
							let i = scripts.length
							while (i--) {
									scripts[i].remove()
							}
							ipcRenderer.send('myapp:reloadWindow', windowId)
					}
			}
			window.addEventListener('keydown', listener)
		}
	process.on('uncaughtException', function(error) { onUnexpectedError(error, enableDevTools) })
	return function () {
		if (listener) {
			window.removeEventListener('keydown', listener)
			listener = void 0
		}
	}
}

function createScript(src, onload) {
	let script = document.createElement('script')
	script.src = src
	script.addEventListener('load', onload)
	let head = document.getElementsByTagName('head')[0]
	head.insertBefore(script, head.lastChild)
}


function main(){
	const { webFrame } = require('electron')

	const args = parseURLQueryArgs()
	const configuration = JSON.parse(args['config'] || '{}') || {}
	// assign(process.env, configuration.userEnv);
	// console.dir(configuration);
	const enableDevTools  = process.env['NODE_ENV']? true: false
	const listener2Dispose = registerListeners(enableDevTools,configuration.windowId)
	const zoomLevel = configuration.zoomLevel
	webFrame.setVisualZoomLevelLimits(1,1)
	if (typeof zoomLevel === 'number' && zoomLevel !== 0) {
		webFrame.setZoomLevel(zoomLevel)
	}
	const rootUrl = uriFromPath(configuration.appRoot)
	console.log(rootUrl)
	createScript(rootUrl + './loader.js', function () {
		require.config({
			baseUrl: rootUrl,
		})
		require(['./renderer-process/renderer.main'], function (renderProcess) {
			console.log('RenderProcess before Loading')
			//let renderProcess = require('./renderer-process/renderer.main.js')
			renderProcess.startUP(configuration)
			.then(()=>{
				console.log('RenderProcess Loading done ...')
			}).catch((error)=>{
				onUnexpectedError(error, enableDevTools)
			}).finally(()=>{
				listener2Dispose()
			})
		})
	})
}

main()
