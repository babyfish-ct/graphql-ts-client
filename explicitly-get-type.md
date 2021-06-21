Sometimes you need to get the automaitcally infered data type to design your API, do it like this

```
import { ModelType } from 'graphql-ts-client';
import .. other importing statements ...

const fetcher = 
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

export type DepartmentDetailInfo = ModelType<typeof fetcher>;
```

Now, you can use the explicit type 'DepartmentDetailInfo ' to design your API.


____________________

[Back to home](https://github.com/babyfish-ct/graphql-ts-client)