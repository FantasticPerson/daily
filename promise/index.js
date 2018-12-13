const IsFunction = fn => typeof fn === 'function'

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class IPromise {
    constructor(handler){
        if(!IsFunction(handler)){
            throw new Error('IPromise must accept a promise as parameter')
        }
        this._status = PENDING
        this._value = undefined
        try{
            handler(this._resolve.bind(this),this._reject.bind(this))
        }catch(e){
            this._reject(err)
        }
    }
    _resolve(val){
        if(this._status !== PENDING) return
        this._status = FULFILLED
        this._value = val
    }
    _reject(err){
        if(this._status !== PENDING) return
        this._status = REJECTED
        this._value = err
    }
}