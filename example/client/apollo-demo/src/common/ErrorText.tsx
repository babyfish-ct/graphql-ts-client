import { ApolloError, ServerError } from "@apollo/client";
import { FC, memo } from "react";
import { ERROR_CSS, FORM_CSS } from "./CssClasses";

export const ErrorText: FC<{
    error: ApolloError
}> = memo(({error}) => {

    const serverErrors = (error.networkError as any).result?.errors as {readonly message: string}[] | undefined;
    return (
        <div className={ERROR_CSS}>
            <div className={FORM_CSS}>
                {
                    serverErrors && 
                    <ul>
                        {
                            serverErrors.map((serverError, index) =>
                                <li key={index}>{serverError.message}</li> 
                            )
                        }
                    </ul>
                }
                {
                    serverErrors === undefined && error.networkError && 
                    <div>
                        <div>Network error</div>
                        <div>{error.networkError.message}</div>
                    </div>
                }
                {
                    error.clientErrors.length !== 0 && 
                    <div>
                        <div>Client errors</div>
                        <div>
                            <ul>
                                {
                                    error.clientErrors.map(ce =>
                                        <li>{ce.message}</li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                }
                {
                    error.graphQLErrors.length !== 0 && 
                    <div>
                        <div>GraphQL errors</div>
                        <div>
                            <ul>
                                {
                                    error.graphQLErrors.map(ce =>
                                        <li>{ce.message}</li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
});