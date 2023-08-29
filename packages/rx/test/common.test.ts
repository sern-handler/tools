import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {composable, once, time, useMutableState} from '../src/index'
import {of, from } from 'rxjs'
describe('sern/rx common operators', () => {

   beforeEach(() => {
        vi.useFakeTimers()
   })

   afterEach( () => {
        vi.restoreAllMocks()
   })

   it("subscription completes after 2 seconds", () => {
    const completion = vi.fn(() => void 0)
    of("x").pipe(time(5_000)).subscribe({
       complete: () => {
           completion()  
       }
    })
    vi.advanceTimersByTime(2000)
    expect(completion).toHaveBeenCalled()
   });

   it("should call once and close", () => {
       const tapOnce = vi.fn((a : number) => a)
       const sub = from([1,2,3,4,5]).pipe(once(tapOnce)).subscribe()

       expect(tapOnce).toHaveBeenCalledOnce()
       expect(sub.closed).toBe(true)
   })

})

describe("composable", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })
    it("should close without calling unsubscribe manually", () => {
        const [data, setData, manager] = useMutableState("shiddd")
        composable((close) => {
            if(data() === "shiddd") {
                setData("pooo")
            } else close()
        }, [manager]);
        expect(manager.closed).toBe(true)
    })

    it("should invoke size of string's length", () => {
        let invoke = 0
        const theString = "shiddd"
        const [data, setData, manager] = useMutableState(theString)
        composable((close) => {
            const str = data()
            if(str.length != 0) {
                invoke++
                setData(str.slice(0, str.length-1))
            } else {
                close()
            }
        }, [manager]);
        expect(manager.closed).toBe(true)
        expect(invoke).toBe(theString.length)
    })

    it("should act as an Observable stream", () => {
        let invoke = 0
        composable(() => {
            invoke++
        }, [from([1,2,3,4,5])])
        expect(invoke).toBe(5)

    })

    it("should concat a string based on event", () => {

        const [data, setData] = useMutableState("")
        composable((_, source) => {
            setData(data() + source)
        }, [from([1,2,3,4,5])])
        expect(data()).toBe("12345")
    })
})

//
// describe("completeFirst", () => {
//
//     it("should invoke twice", () => {
//         let invoke = 0
//         from([1,2,3,4,5]).pipe(
//              completeOnFirst([take(2)])
//         ).subscribe((s) => {
//             console.log(s)
//             invoke++
//         })
//
//         expect(invoke).toBe(2)
//
//     })
// })
