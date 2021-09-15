# Core idea: Fetcher

Fetcher is the core concept of this framework. For each ObjectType in GraphQL, a Fetcher will be generated, including Query and Muation

If the target directory configured in the code generator is"src/__generated"，Then all fetchers are located at "src/__generated/fetchers"

There are three ways to use this framework
1. Standalone use
2. Use with @apollo/client
3. Use with relay

In order to simplify the documentation, except for a few chapters, fetcher related documents are explained in an Standalone usage.

1. [Basic Usage](./basic.md)
2. [Default Fetcher](./default-fetcher.md)
3. [Parameter](./variables.md)
4. [Fragment and Polymorphic Query](./fragment.md)
5. [Alias](./alias.md)
6. [Directive](./directive.md)

----------------------
[Back to parent](../README.md) | [< Previous: Code generator](../generator.md) | [Next: Use with @apollo/client>](../apollo.md)
