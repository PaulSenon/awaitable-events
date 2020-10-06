

class AwaitableEventManager {
    constructor() {
        this._observables = [];
    }
  
    on(eventName){
        return new Promise((resolve, reject) => {
            const observer = new Observer(data => {
            resolve(data);
            observer.unsubscribe();
            });
    
            let observable = this._getOrCreateObservable(eventName);
            observable.subscribe(observer);
        });
    }
  
    fire(eventName, data) {
        const observable = this._getOrCreateObservable(eventName);
        observable.dispacth(data);
    }
  
    _getOrCreateObservable(eventName) {
        let observable = this._getObservable(eventName);
        if(!observable) {
            observable = new Observable(eventName);
            this._observables.push(observable);
        }
        return observable;
    }
  
    _getObservable(eventName){
        return this._observables.find(o => o.getEventName() === eventName);
    }
}
  
class Observable {
    constructor(eventName) {
        this._eventName = eventName
        this._observers = [];
        this._hasBeenDispatched = false;
        this._lastDispatchedData;
    }
  
    getEventName() {
        return this._eventName;
    }
  
    subscribe(observer){
        this._observers.push(observer);
        observer.setObservable(this);
        if(this._hasBeenDispatched){
            observer.execute(this._lastDispatchedData);
        }
    }
  
    removeObserver(observer){
        this._observers = this._observers.filter(o => o !== observer);
    }
  
    dispacth(data) {
        for(let observer of this._observers){
            observer.execute(data);
        }
        // this._observers.map(o => o.execute(data));
        this._hasBeenDispatched = true;
        this._lastDispatchedData = data;
    }
}
  
class Observer {
    constructor(cb) {
        this._callback = cb;
        this._observable;
    }
  
    setObservable(observable) {
        this._observable = observable;
    }
  
    unsubscribe() {
        this._observable.removeObserver(this);
        this._observable = undefined;
    }
  
    execute(data) {
        this._callback(data);
    }
}
  
module.exports = AwaitableEventManager;
  