import { ApolloError } from "@apollo/client";
import { FC, memo } from "react";
import { ERROR_CSS, FORM_CSS } from "./CssClasses";

export const ErrorText: FC<{
    error: ApolloError
}> = memo(({error}) => {

    return (
        <div className={ERROR_CSS}>
            <h2>{error.message}</h2>
            <div className={FORM_CSS}>
                {
                    error.networkError && 
                    <div>
                        <div>Network error</div>
                        <div>{error.networkError.message}</div>
                    </div>
                }
                {
                    error.clientErrors && 
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
                    error.graphQLErrors && 
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