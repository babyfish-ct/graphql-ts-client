import { useEffect } from "react";
import { Options } from "react-relay/relay-hooks/useRefetchableFragmentNode";
import { DataID, Variables } from "relay-runtime";

export function refreshFragment(id: DataID, reason?: string) {
    window.dispatchEvent(new CustomEvent(EVENT_KEY_REFRESH_FRAGMENT, { detail: {id, reason}}));
}

export function useFragmentRefresher(id: DataID, reason: string | undefined, refetch: (variables: Variables, options?: Options) => void) {
    useEffect(() => {
        const handler = (e: CustomEvent) => {
            if (e.detail.id === id && e.detail.reason === reason) {
                refetch({}, {fetchPolicy: "network-only"});
            }
        };
        (window as any).addEventListener(EVENT_KEY_REFRESH_FRAGMENT, handler);
        return () => {
            (window as any).removeEventListener(EVENT_KEY_REFRESH_FRAGMENT, handler);
        }
    }, [id, refetch]);
}

const EVENT_KEY_REFRESH_FRAGMENT = "refreshFragment";