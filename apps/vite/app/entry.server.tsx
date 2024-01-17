import { handleRequest } from '@vercel/remix';
import { RemixServer } from '@remix-run/react';
import {type EntryContext} from "@remix-run/node";
import {renderToPipeableStream} from "react-dom/server";
 
export default function (
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    let ABORT_DELAY = 1000;
    const { pipe, abort } = renderToPipeableStream(
        <RemixServer
            context={remixContext}
            url={request.url}
            abortDelay={ABORT_DELAY}
        />,
        {
            nonce: "secretnoncevalue",
            /* ...remaining fields */
        }
    );

    const remixServer = <RemixServer context={remixContext} url={request.url} />;
    return handleRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixServer,
    );
}