import {ButtonInteraction, ComponentType, InteractionType, ModalSubmitInteraction } from 'discord.js'
import { filter, from, of } from 'rxjs'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import { DJS } from '../src/index'
import {clientEvent, distinctCustomId, matchesCustomId, toCollection} from "../src/djs";
import {EventEmitter} from "events";
import {fail} from "assert";
import exp from "constants";

vi.mock('discord.js', () => {

        const Collection = Map
        const ModalSubmitInteraction = class {
            customId
            type = 5
            isModalSubmit = vi.fn()
            constructor(customId) {
                this.customId = customId
            }
        }
        const ButtonInteraction = class {
            customId
            type = 3
            componentType = 2
            isButton = vi.fn()
            constructor(customId) {
                this.customId = customId
            }
        }
        return {
            Collection,
            ComponentType: { 
                Button: 2
            },
            InteractionType : {
                MessageComponent : 3,
                ModalSubmit : 5
            },
            ModalSubmitInteraction,
            ButtonInteraction 
        };
})

describe("test isButton ", () => {
    let btnInteraction 
    beforeEach( () => {
        btnInteraction = new ButtonInteraction("hello")
    })
    afterEach(() => vi.clearAllMocks())
    it("should invoke isButton 0 times", () => {
        let invoked = 0;
        from("not a discord button interaction").pipe(
            filter(DJS.isButton)
        ).subscribe(() => invoked++)
        expect(invoked).toBe(0)
        
    });

    it("should invoke isButton once", () => {
        let invoked2 = 0;
        btnInteraction.isButton.mockReturnValue(
            btnInteraction.componentType === ComponentType.Button
            && btnInteraction.type === InteractionType.MessageComponent
        )
        of(btnInteraction).pipe(
            filter(DJS.isButton)
        ).subscribe(() => invoked2++) 
        expect(invoked2).toBe(1)
    })
})

describe("match customid operator", () => {
    let buttonInteraction

    beforeEach(() => {
        buttonInteraction = new ButtonInteraction("hello-world")
        buttonInteraction.isButton.mockReturnValue(true)
    })
    afterEach(() => {
        vi.clearAllMocks()
    })
    it("shouldn't invoke", () => {
        let invoked = 0

        of(buttonInteraction).pipe(
            filter(DJS.isButton),
            matchesCustomId("pooba")
        ).subscribe(() => invoked++)
        expect(invoked).toBe(0)

    })
    it("should invoke once", () => {
        let invoked = 0
        of(buttonInteraction).pipe(
            filter(DJS.isButton),
            matchesCustomId("hello-world")
        ).subscribe(() => invoked++)
        expect(invoked).toBe(1)
    })
})

describe("toCollection operator", () => {
    it("should fill 10 elements", () => {
        const expectedMap = new Map([
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [5, 5],
            [6, 6],
            [7, 7],
            [8, 8],
            [9, 9],
            [10, 10]
        ])
        let coll
        from([1,2,3,4,5,6,7,8,9,10]).pipe(
            toCollection(src => [src, src])
        ).subscribe(collection => {
            coll = collection
        })
        expect(coll).toEqual(expectedMap)
    })
})

describe("distinct custom id operator", () => {
    it("should invoke once", () => {
        let invoked = 0;
        from([new ButtonInteraction("p1"),new ButtonInteraction("p1"),new ButtonInteraction("p1") ])
            .pipe(distinctCustomId)
            .subscribe(() => invoked++)
        expect(invoked).toBe(1)
    })

    it("should invoke twice", () => {
        let invoked = 0;
        from([new ButtonInteraction("p1"),new ButtonInteraction("p1"),new ButtonInteraction("p2") ])
            .pipe(distinctCustomId)
            .subscribe(() => invoked++)
        expect(invoked).toBe(2)
    })

})

describe("isModal predicate", () => {
    afterEach(() => {
        vi.clearAllMocks()
    })
    it("should invoke once", () => {
        let invoked = 0
        const m = new ModalSubmitInteraction("p1")
        m.isModalSubmit.mockReturnValue(m.type === InteractionType.ModalSubmit)
        const b = new ButtonInteraction("p2")
        b.isButton.mockReturnValue(b.type === InteractionType.MessageComponent && b.componentType === ComponentType.Button)
        from([m, b])
            .pipe(filter(DJS.isModal))
            .subscribe(() => invoked++)
        expect(invoked).toBe(1)
    })
})


describe("clientEvent observable generator", () => {
    let c
    let cEvent
    let btnClickFromClientEvent
    beforeEach(() => {
        c = new EventEmitter()
        cEvent = clientEvent(c, 'interactionCreate').subscribe((b) =>btnClickFromClientEvent = b )
    })
    afterEach( () => {
        vi.clearAllMocks()
        cEvent.unsubscribe()
    })

    it("should yield ButtonInteraction ", () => {
        const btnClick = new ButtonInteraction("p1")
        c.emit('interactionCreate', btnClick)
        expect(btnClick).toBe(btnClickFromClientEvent)
    })

    it("should not emit correctly", () => {
        const btnClick = new ButtonInteraction("p1")
        const modalSubmit = new ModalSubmitInteraction("p1")
        c.emit('interactionCreate', modalSubmit)
        expect(btnClickFromClientEvent).not.toBe(btnClick)
    })
})