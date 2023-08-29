import type {EventEmitter} from "events";
import {
    BehaviorSubject,
    defer,
    fromEvent,
    mergeMap,
    type MonoTypeOperatorFunction,
    Observable,
    Subject, switchMap,
    take,
    takeUntil,
    tap,
    timer,
    concatMap,
    pipe,
    catchError
} from "rxjs";

export * as DJS from './djs/index.js'

export interface CustomId {
    customId: string;
}


/**
 * Creates an observable using fromEvent & casts it to Observable<O>
 * @param name
 * @param e
 */
export function on<O>(name: string, e: EventEmitter): Observable<O> {
    return fromEvent(e, name) as Observable<O>;
}

/**
 * Do some task that requires asynchronous await API and reedits the source
 * @param cb
 */
export function asyncTask<Event>(cb: (e: Event) => Promise<unknown>) {
    return (src$: Observable<Event>) => src$.pipe(switchMap(cb), mergeMap(() => src$))
}

/**
 * the operator function takeUntil with a timer. Completes the source stream after time has been reached
 * @param time a Date object or number (milliseconds)
 */
export function time<Event>(time: Date | number) {
    return takeUntil(timer(time)) as MonoTypeOperatorFunction<Event>
}

/**
 * @param action
 * Responds to one interaction and calls { action }.
 * Unsubscribes and closes subscription afterwards
 */
export function once<Event>(action: (e: Event) => unknown) {
    return (source$: Observable<Event>) =>
        defer(() => {
            let isFirst = true;
            return source$.pipe(
                tap(v => {
                    if (isFirst) {
                        action(v);
                        isFirst = false;
                    }
                }),
                take(1)
            );
        });
}

/**
 * @Experimental - This api may be moved to another package, deleted, or anything. consider it for playing around only
 * The scope which a composable function acts on.
 */
class ComposableScope<Source> {
    private symbol = Symbol("nothing");

    constructor(
        private updater: Subject<Source>,
        private listeners: (BehaviorSubject<unknown> | Observable<unknown>)[]
    ) {}

    private executeIfUpdaterNotClosed(action: () => any) {
        if (!this.updater.closed) {
            action()
        }
    }

    listen(recomposable: (close: () => void, source: Source) => unknown) {
        const updaterFinalizer = () => this.updater.complete();
        this.updater
            .subscribe({
                next: data => recomposable(updaterFinalizer, data),
                complete: () => {
                    this.listeners.forEach(s => {
                        if (s instanceof BehaviorSubject) {
                            s.unsubscribe()
                        }
                    })
                },
                error: () => {
                    this.listeners.forEach(s => {
                        if (s instanceof BehaviorSubject) {
                            s.unsubscribe()
                        }
                    })
                }
            })

        if (this.listeners.length === 0) {
            this.updater.complete()
        } else {
            for (const subject of this.listeners) {
                subject.subscribe((data) => {
                    if (subject instanceof Observable) {
                        this.executeIfUpdaterNotClosed(() => {
                            this.updater.next(data as Source)
                        })
                    } else {
                        this.executeIfUpdaterNotClosed(() => {
                            this.updater.next(this.symbol as Source)
                        })
                    }
                })
            }
        }
    }
}

/**
 * @Experimental - This api may be moved to another package, deleted, or anything. consider it for playing around only
 * @param seed - The beginning value. This works similarly to react useState or compose remember mutableStateOf
 */
export function useMutableState<T>(seed: T) {
    const stateManager = new BehaviorSubject(seed)
    return [
        () => stateManager.getValue(),
        (vl: T) => stateManager.next(vl),
        stateManager,
    ] as const
}

export type Listeners = (BehaviorSubject<unknown> | Observable<unknown>)[]

/**
 * @Experimental - This api may be moved to another package, deleted, or anything. consider it for playing around only
 * Creates a scope that can executed as many times as needed, provided it is listening to data.
 * @param scope - Executes callback until
 * @param listeners
 */
export function composable<Source>(
    scope: (close: () => void, source: Source) => unknown,
    listeners: Listeners
) {
    const composableScope = new ComposableScope<Source>(new Subject(), listeners);
    composableScope.listen(scope)
}


export function filterMap<I, O>(cb: (i: I) => Observable<O> | Observable<never>) {
    return concatMap(cb)
}
type StreamResult = 
    | { crash: true, error: Error }
    | { crash: false, error?: never }
    
export function failableStream<I, O(
    pipeline: typeof pipe,
    ehandler: (e: any) => StreamResult
) {

    return pipe(
        pipeline,
        catchError((err, caught) => {
           const { crash, error } = ehandler(err)
           if(crash) {
             throw error 
           } else {
              return caught;
           }
        })
    );

}
//
// /**
//  *
//  * @param notifiers Should be terminal operators. Meaning, these should have some logic to close its subscription
//  */
// export function completeOnFirst<Event>(notifiers: MonoTypeOperatorFunction<Event>[]) {
//     return (src: Observable<Event>) =>
//         src.pipe(raceWith(notifiers.map(notif => src.pipe(notif))));
// }
//
//
