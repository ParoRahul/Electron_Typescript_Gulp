/* eslint-disable @typescript-eslint/no-empty-function */
'use strict'

export interface IDisposable {
  dispose(): void;
}

export function isDisposable<T extends object>( thing: T): thing is T & IDisposable {
  return (
    typeof (<IDisposable>thing).dispose === 'function' &&
    (<IDisposable>thing).dispose.length === 0
  )
}

export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>( disposable: T | undefined): T | undefined;
export function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export function dispose<T extends IDisposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>;
export function dispose<T extends IDisposable>( disposables: T | T[] | undefined): T | T[] | undefined {
  if (Array.isArray(disposables)) {
      disposables.forEach((d) => {
        if (d) {
          d.dispose()
        }
      })
      return []
  } else if (disposables) {
      disposables.dispose()
      return disposables
  } else {
      return undefined
  }
}

export function toDisposable(fn: () => void): IDisposable {
  const self = Object.assign({}, { dispose: function(){ fn() } })
  return self
}

export class DisposableStore implements IDisposable {
  static DISABLE_DISPOSED_WARNING = false;

  private _toDispose = new Set<IDisposable>();
  private _isDisposed = false;

  dispose(): void {
    if (this._isDisposed) {
      return
    }
    this._isDisposed = true
    this.clear()
  }

  clear(): void {
    this._toDispose.forEach((item) => item.dispose())
    this._toDispose.clear()
  }

  add<T extends IDisposable>(t: T): T {
    if (!t) {
      return t
    }
    if (((t as unknown) as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn( new Error(
            `Trying to add a disposable to a DisposableStore that has already been disposed of.
            The added object will be leaked!`
          ).stack )
      }
    } else {
      this._toDispose.add(t)
    }
    return t
  }
}

export abstract class Disposable implements IDisposable {
  static readonly None = Object.freeze<IDisposable>({ dispose() {return} });

  private readonly _store = new DisposableStore();

  constructor() {}

  dispose(): void {
    this._store.dispose()
  }

  protected _register<T extends IDisposable>(t: T): T {
    if (((t as unknown) as Disposable) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(t)
  }
}
