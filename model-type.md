Sometimes you need to get the automaitcally infered data type to design your API, ModelType can resolve this problem

First, import ModelType.
```
import { ModelType } from 'graphql-ts-client-api';
```

Then, declare a fetcher

```ts

import .. More importing statements ...

const DEPARTMENT_ITEM_FETCHER = 
	department$$
	.employees(
		employee$$
		.supervisor(
			employee$$
		)
		.subordinates(
			employee$$
		)
	);
```

Now, you have 2 choices

1. Use the infered type implicitly

```ts
export function processDepartmentItems(
    items: ModelType<typeof DEPARTMENT_ITEM_FETCHER>[]
) {
    ... More code ...
}
```

2. Use the infered type explicitly
```ts

export type DepartmentItem = ModelType<typeof DEPARTMENT_ITEM_FETCHER>;

export function processDepartmentItems(
    items: DepartmentItem[]
) {
    ... More code ...
}
```

____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)