const AwaitableEventManager = require('../src/AwaitableEventManager');

describe('test AwaitableEventManager', () => {
    it('should be triggered when subscribed after event is fired', () => {
        const aem = new AwaitableEventManager();
        let flag = false;

        const asyncTest = aem.on('testEvent').then((data) => {
        expect(data).toBe('testData');
        expect(flag).toBe(true);
        })

        // expect observer to have been referenced
        const observableRef = aem._getObservable('testEvent');
        expect(observableRef._observers.length).toBe(1);

        // mimic real usecase : set a var and dispatch event
        flag = true;
        aem.fire('testEvent', 'testData');

        // expect observer to have been unreferenced
        expect(observableRef._observers.length).toBe(0);

        return asyncTest;
    });
    it('should be triggered when subscribed before event is fired', async () => {
        const aem = new AwaitableEventManager();

        aem.fire('testEvent', 'testData');

        await expect(aem.on('testEvent')).resolves.toBe('testData');

        // expect observer to have been unreferenced
        const observableRef = aem._getObservable('testEvent');
        expect(observableRef._observers.length).toBe(0);
    });
    it('should be triggered only once', () => {
        const aem = new AwaitableEventManager();
        let nbTrigger = 0;

        aem.fire('testEvent');
        aem.fire('testEvent');

        // expect observer to not have been referenced yet
        const observableRef = aem._getObservable('testEvent');
        expect(observableRef._observers.length).toBe(0);

        const asyncTest = aem.on('testEvent').then(() => {
        nbTrigger++;
        expect(nbTrigger).toBe(1);
        })

        // expect observer to have been already unreferenced
        expect(observableRef._observers.length).toBe(0);

        aem.fire('testEvent');
        aem.fire('testEvent');

        return asyncTest;
    });
    it('should not be triggered by other event', async () => {
        const aem = new AwaitableEventManager();

        const promise = aem.on('testEvent');

        // expect observer to have been referenced
        const observableRef = aem._getObservable('testEvent');
        expect(observableRef._observers.length).toBe(1);

        aem.fire('wrongEvent', 'wrongData');

        // expect observer to not have been unreferenced
        expect(observableRef._observers.length).toBe(1);

        aem.fire('testEvent', 'testData');

        // expect observer to have been unreferenced
        expect(observableRef._observers.length).toBe(0);

        await expect(promise).resolves.toBe('testData');
    });
    it('should trigger multiple subscribers', async () => {
        const aem = new AwaitableEventManager();

        aem.fire('testEvent3', 'event3Data');

        // expect observer to not have been referenced yet
        const observable3Ref = aem._getObservable('testEvent3');
        expect(observable3Ref._observers.length).toBe(0);

        const promises = [
        aem.on('testEvent1'),
        aem.on('testEvent1'),
        aem.on('testEvent2'),
        aem.on('testEvent3'),
        ];

        // expect observer to have been referenced
        const observable1Ref = aem._getObservable('testEvent1');
        expect(observable1Ref._observers.length).toBe(2);
        const observable2Ref = aem._getObservable('testEvent2');
        expect(observable2Ref._observers.length).toBe(1);
        // expect observer to have been already unreferenced
        expect(observable3Ref._observers.length).toBe(0);

        aem.fire('testEvent1', 'event1Data');

        // expect only observer of event 1 to have been unreferenced
        expect(observable1Ref._observers.length).toBe(0);
        expect(observable2Ref._observers.length).toBe(1);

        aem.fire('testEvent2', 'event2Data');

        // expect all observer to have been unreferenced
        expect(observable1Ref._observers.length).toBe(0);
        expect(observable2Ref._observers.length).toBe(0);

        await expect(Promise.all(promises)).resolves.toStrictEqual(['event1Data', 'event1Data', 'event2Data', 'event3Data']);
    });
})
