
# @sern/builder

`@sern/builder` is a TypeScript library that provides a type-safe and declarative builder to create data for the Discord API. At the moment it only creates `options for chat input command.` PRs are welcome! 

## Installation

You can install `@sern/builder` using npm or yarn:

```bash
npm install @sern/builder
```
or

```bash
yarn add @sern/builder
```

## Features
- Small size: `<= 2kb`
- Type-safe builder: Create data for the Discord API with full type checking.
- Declarative and minimal syntax: Build data using a clean and intuitive syntax.
- Supports all option types: String, number, attachment, integer, user, channel, and mentionable and subcommands
- Validates data: checks names and description based on Discord Api regexes
- 'Bottom up Builders': Each function is composable and individual, 
     - Traditional builders contain an intermediary invalid state, while pure functions yield 'valid state'
     - This allows more flexible structures and substructures while being `declarative` and `less noisy`

## Usage

Here's an example of how to use `@sern/builder` to create a subcommandgroup structure for the Discord API:

```javascript
import { str, name, description, NoValidator, Flags, subcommandgroup, subcommand, length, _ } from '@sern/builder';

const tree = subcommandgroup(
        name('group'),
        description('bunch of subcommands'),
        [
            subcommand(
                name("first"),
                description("second"),
                [
                 str(
                  name("choose"),
                  description("pick one of the following"),
                  length(_, 10),
                  Flags.Required | Flags.Autocomplete),
                ]
            )]
        ) 
```

## Contributing

Contributions to `@sern/builder` are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/sern-handler/option).

Before contributing, please make sure to read the [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).

---

Thank you for using `@sern/builder`! If you have any questions or need further assistance, please feel free to reach out.
