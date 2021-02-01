'use strict'

import { TimeoutTimer } from '../../common/async'
import { IEvent, Emitter } from '../base/event'
import { Disposable } from '../../common/disposable'
import * as dom from '../base/dom'

export enum EUserStatus {
	Idle,
	Active
}

export class IdleMonitor extends Disposable {

	private _lastActiveTime: number;
	private _idleCheckTimeout: TimeoutTimer;
	private _status: EUserStatus;
	private _idleTime: number;

	private _onStatusChange: Emitter<EUserStatus>;
	get onStatusChange(): IEvent<EUserStatus> { return this._onStatusChange.event }

	constructor(idleTime: number) {
		super()

		this._status = null
		this._idleCheckTimeout = this._register(new TimeoutTimer())
		this._lastActiveTime = -1
		this._idleTime = idleTime
		this._onStatusChange = new Emitter<EUserStatus>()

		this._register(dom.addDisposableListener(document, 'mousemove', () => this._onUserActive()))
		this._register(dom.addDisposableListener(document, 'keydown', () => this._onUserActive()))
		this._onUserActive()
	}

	get status(): EUserStatus {
		return this._status
	}

	private _onUserActive(): void {
		this._lastActiveTime = (new Date()).getTime()

		if (this._status !== EUserStatus.Active) {
			this._status = EUserStatus.Active
			this._scheduleIdleCheck()
			this._onStatusChange.fire(this._status)
		}
	}

	private _onUserIdle(): void {
		if (this._status !== EUserStatus.Idle) {
			this._status = EUserStatus.Idle
			this._onStatusChange.fire(this._status)
		}
	}

	private _scheduleIdleCheck(): void {
		const minimumTimeWhenUserCanBecomeIdle = this._lastActiveTime + this._idleTime
		const timeout = minimumTimeWhenUserCanBecomeIdle - (new Date()).getTime()

		this._idleCheckTimeout.setIfNotSet(() => this._checkIfUserIsIdle(), timeout)
	}

	private _checkIfUserIsIdle(): void {
		const actualIdleTime = (new Date()).getTime() - this._lastActiveTime

		if (actualIdleTime >= this._idleTime) {
			this._onUserIdle()
		} else {
			this._scheduleIdleCheck()
		}
	}
}
