/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */


/*
 * This helper function is used to mock the network delay
 */
export async function delay(millis: number): Promise<void> {
    return new Promise(
        resolve => setTimeout(resolve, millis)
    );
}