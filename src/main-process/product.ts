'use strict'

//import * as path from 'path'
//import * as url from 'url'
//import { app } from 'electron'
/* const rootPath = app.getAppPath()

const productJsonPath = path.join(rootPath, 'product.json')*/

//import * as productData from './product.json'


//const productData: IproductConfiguration = require('./product.json')

export interface IProductConfiguration {
	nameShort: string;
	nameLong: string;
	applicationName: string;
	win32AppId: string,
	win32AppUserModelId: string,
	darwinBundleIdentifier: string,
	urlProtocol: string;
	dataFolderName: string;
	downloadUrl: string;
	updateUrl?: string;
	date: string;
	documentationUrl: string;
	releaseNotesUrl: string;
	introductoryVideosUrl: string;
	twitterUrl: string;
	reportIssueUrl: string;
	licenseName: string,
	licenseUrl: string;
}


/* const rootPath = app.getAppPath()

const productJsonPath = path.join(rootPath, 'product.json') */

/* const rootPath = app.getAppPath()

const productJsonPath = path.join(rootPath, 'product.json') */

//export const product: IproductConfiguration = require(productJsonPath)

//export const product = productData as IproductConfiguration


export const product: IProductConfiguration = {
	nameShort: "My APP",
	nameLong: "My APP",
	applicationName: "my-App",
	dataFolderName: ".myApp",
	licenseName: "MIT",
	licenseUrl: "https://github.com/ParoRahul/Electron-Typescript-App.git",
	win32AppId: "{{E34003BB-9E10-4501-8C11-BE3FAA83F23F}",
	win32AppUserModelId: "Rahul.myApp",
	darwinBundleIdentifier: "com.myApp.oss",
	reportIssueUrl: "https://github.com/ParoRahul/Electron-Typescript-App.git",
	urlProtocol: "myApp-pro",
	downloadUrl: "",
	updateUrl: "",
	date: "",
	documentationUrl:"",
	releaseNotesUrl: "",
	introductoryVideosUrl: "",
	twitterUrl: ""
}

if (process.env['NODE_ENV'] == 'development') {
	product.nameShort += ' Dev'
	product.nameLong += ' Dev'
	product.dataFolderName += '-dev'
}