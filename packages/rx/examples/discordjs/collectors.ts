import {ButtonInteraction, ChatInputCommandInteraction, Collection, ComponentType} from "discord.js";
import {filter, firstValueFrom, take} from 'rxjs'
import {asyncTask, DJS, on, once, time} from "../../src/index.js";
import {clientEvent, matchesCustomId} from "../../src/djs";

//Hypothetical interaction source
declare const ctx : ChatInputCommandInteraction

// create a collector that accepts distinct interactions.
// A timer is set to 5 seconds and it will emit one collection where its key is the interaction's id and value the interaction.
const reactiveCollector = on<ButtonInteraction>('collect', ctx.channel.createMessageComponentCollector({ componentType: ComponentType.Button }))
    .pipe(
        DJS.distinctCustomId,
        time(5000),
        DJS.toCollection(src => [src.id, src], 4),
    )
//Collection as promise
const promisedCollection = firstValueFrom(reactiveCollector, { defaultValue : new Collection() })

//Collection subscription
const subscriptionCollection = reactiveCollector.subscribe({
    next: (collection) => console.log(collection),
    error: (err) => console.log(err),
    complete: () => console.log("The collector has finished") //synonymous to the 'end' event for basic discord.js collectors!
})

//Creates a base button handler that matches the given customId
const buttonHandler = clientEvent(ctx.client, 'interactionCreate')
    .pipe(
        filter(DJS.isButton), matchesCustomId("i-miss-her"),
    )

//From the buttonHandler, defer the update and set a timeout of 60_000. Then it executes once, finally closing the subscription
buttonHandler.pipe(
    asyncTask( b => b.deferUpdate()),
    time(60_000 ), // 1 minute
    once((b) => b.editReply(`You clicked a button once`))
).subscribe()

