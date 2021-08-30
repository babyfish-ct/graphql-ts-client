export async function executeGraphQL(request: string, variables: object): Promise<any> {
	const response = await fetch('http://localhost:8080/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: request,
			variables,
		}),
	}); 
	return await response.json();
}