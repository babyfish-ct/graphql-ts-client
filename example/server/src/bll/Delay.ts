/*
 * This helper function is used to mock the network delay of database
 */
export async function delay(millis: number): Promise<void> {
    return new Promise(
        resolve => setTimeout(resolve, millis)
    );
}