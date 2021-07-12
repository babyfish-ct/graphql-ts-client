This is an experimental functionality, that's why it's is declared in [https://github.com/babyfish-ct/graphql-ts-client/blob/master/example/client/src/state/common/FetchableSelectorFamily.ts](https://github.com/babyfish-ct/graphql-ts-client/blob/master/example/client/src/state/common/FetchableSelectorFamily.ts), not in the 'graphql-ts-client-api'.

You can copy this file into your project if it's helpful for you.

'graphql-ts-client' infers the type of returned by strongly-type graphql query request, different queries return data with different types.

'selectorFamily' of 'recoil' returns fixed type, no matter what type of parameter is passed in.

This file supports three wrapper functions base on 'selectorFamily',

you can use them when the last argument of query/mutation function is Fetcher.



Comparsion:



| Function                         | Signature                                                    |
| -------------------------------- | ------------------------------------------------------------ |
| selectorFamily                   | &lt;P&gt;(param: P) =&gt; Fixed type                         |
| fetchableSelectorFamily.required | &lt;P, T&gt;(param: P, fetcher: Fetcher&lt;?, T&gt;) =&gt; T |
| fetchableSelectorFamily.optional | &lt;P, T&gt;(param: P, fetcher: Fetcher&lt;?, T&gt;) =&gt; T &#124; undefined |
| fetchableSelectorFamily.list     | &lt;P, T&gt;(param: P, fetcher: Fetcher&lt;?, T&gt;) =&gt; readonly T[] |


____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)