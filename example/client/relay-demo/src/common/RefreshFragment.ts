import { useEffect } from "react";
import { Options } from "react-relay/relay-hooks/useRefetchableFragmentNode";
import { DataID, Variables } from "relay-runtime";

export function refreshFragment(id: DataID) {
    window.dispatchEvent(new CustomEvent(REFRESH_FRAGMENT, { detail: {id}}));
}

export function useFragmentRefresher(id: DataID, refetch: (variables: Variables, options?: Options) => void) {
    useEffect(() => {
        const handler = (e: CustomEvent) => {
            if (e.detail.id === id) {
                refetch({}, {fetchPolicy: "network-only"});
            }
        };
        (window as any).addEventListener(REFRESH_FRAGMENT, handler);
        return () => {
            (window as any).removeEventListener(REFRESH_FRAGMENT, handler);
        }
    }, [id, refetch]);
}

const REFRESH_FRAGMENT = "refreshFragment";