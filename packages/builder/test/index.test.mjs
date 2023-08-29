import * as assert from 'node:assert/strict';

import {
    str,
    name ,
    description,
    Flags,
    choice,
    identity,
    subcommand,
    subcommandgroup,
    length 
} from '../dist/index.js'

assert.deepEqual(
    str(
        name("option"),
        description("a string option")
    ),
    {
        name: "option",
        description: "a string option",
        type: 3 
    }
);


assert.deepEqual(
    str(
        name("option"),
        description("a string option"),
        length(1, 10)
    ),
    {
        name: "option",
        description: "a string option",
        type: 3,
        max_length: 10,
        min_length: 1
    }
)

assert.deepEqual(
    str(
        name("option"),
        description("option"),
        {},
        Flags.Nsfw | Flags.Required
    ),
    {
        type: 3,
        name: "option",
        description: "option",
        nsfw: true,
        required: true
    }
)
assert.deepEqual(
    choice(
      str(
        name("option"),
        description("option"),
        {},
        Flags.Nsfw | Flags.Required
      ),
      [identity("option1"), identity("option2")]
    ),
    {
        type: 3,
        name: "option",
        description: "option",
        nsfw: true,
        required: true,
        choices: [
            { name: "option1", value: "option1" },
            { name: "option2", value: "option2" }
        ]
    }
);
assert.deepEqual(
    choice(
      str(
        name("option"),
        description("option"),
        {},
        Flags.Nsfw | Flags.Required
      ),
      [identity("option1"), identity("option2")]
    ),
    {
        type: 3,
        name: "option",
        description: "option",
        nsfw: true,
        required: true,
        choices: [
            { name: "option1", value: "option1" },
            { name: "option2", value: "option2" }
        ]
    }
);

assert.throws(
    () => str(
        name("bad option name"),
        description("shid")
    ),
    "name fails regex"
)

assert.throws(
    () => str(
        name("bad option name"),
        description()
    ),  
    "No description"
)

assert.deepStrictEqual(
   subcommand(
    name("eat"),
    description("eat cheese"),
    [
      str( name("gouda"), description("smoked gouda")),
      str( name("parmesan"), description("yummy parm"))
    ],
   ),
   {
    type: 1,
    name: "eat",
    description: "eat cheese",
    options: [
     { name: "gouda", description: "smoked gouda", type: 3 },
     { name: "parmesan", description: "yummy parm", type: 3 },
    ]
   }

)

assert.deepStrictEqual(
   subcommandgroup(
    name("eat"),
    description("eat cheese"),
    [
      subcommand(
        name("eat"),
        description("eat cheese"),
        [
           str( name("gouda"), description("smoked gouda")),
           str( name("parmesan"), description("yummy parm"))
        ]
      ),
    ],
   ),
   {
    type: 2,
    name: "eat",
    description: "eat cheese",
    options: [
     { 
        name: "eat",
        description: "eat cheese",
        type: 1,
        options: [
            { name: "gouda", description:"smoked gouda", type: 3 },
            { name: "parmesan", description:"yummy parm", type: 3 }
        ]
     }
    ]
   }

)
console.log("OK")
