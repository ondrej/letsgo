/**
 * This route is a generic proxy that forwards requests from the browser to the API server while re-writing security.
 * Requests to this route are authenticated using the same authentication mechanism as the rest of the web application -
 * an encrypted cookie is required. Upon receiving a request, this route will forward the request to the API server after
 * adding the bearer access token of the user logged into the browser in the Authorization header, refreshing it
 * if possible and necessary.
 *
 * Request and response bodies, if present, are expected to be JSON.
 *
 * This mechanism is in place to reduce the attack surface area by not exposing API access tokens to the browser.
 */

import {
  AppRouteHandlerFn,
  AppRouteHandlerFnContext,
  withApiAuthRequired,
} from "@auth0/nextjs-auth0";
import proxyFactory from "../../proxy";
import { NextRequest } from "next/server";

// Delay create the proxy implementation because withApiAuthRequired has environment variable expectations
// that may not be met at build time.
let proxyImpl: AppRouteHandlerFn | undefined = undefined;
const proxy = async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
  if (!proxyImpl) {
    proxyImpl = withApiAuthRequired(
      proxyFactory({ addAccessTokenToRequest: true })
    );
  }
  return proxyImpl(req, ctx);
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

// Prevent any caching of responses
export const dynamic = "force-dynamic";
