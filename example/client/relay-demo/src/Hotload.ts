import { format } from 'url';

const wsUrl = format({
    protocol: window.location.protocol === 'https:' ? 'wss' : 'ws',
    hostname: process.env.WDS_SOCKET_HOST || window.location.hostname,
    port: process.env.WDS_SOCKET_PORT || window.location.port,
    pathname: process.env.WDS_SOCKET_PATH || '/ws',
    slashes: true,
});
const connection = new WebSocket(wsUrl);

console.log(wsUrl);

connection.onopen = () => {
    console.log("open--------------");
};

connection.onmessage = function(e: {data: string}) {
    console.log(e.data);
    var message = JSON.parse(e.data)
    switch (message.type) {
        case 'content-changed':
            window.dispatchEvent(new CustomEvent("__source_change"));    
            break;
        default:
            break;
    }
}

export function addSourceChangeListener(handler: () => void) {
    (window as any).addEventListener("__source_change", handler);
}

export function removeSourceChangeListener(handler: () => void) {
    (window as any).removeEventListener("__source_change", handler);
}