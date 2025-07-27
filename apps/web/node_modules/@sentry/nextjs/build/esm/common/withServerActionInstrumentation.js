import { _nullishCoalesce, _optionalChain } from '@sentry/core';
import { withIsolationScope, logger, getActiveSpan, continueTrace, startSpan, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, handleCallbackErrors, SPAN_STATUS_ERROR, captureException, getIsolationScope, vercelWaitUntil, getClient } from '@sentry/core';
import { DEBUG_BUILD } from './debug-build.js';
import { isNotFoundNavigationError, isRedirectNavigationError } from './nextNavigationErrorUtils.js';
import { flushSafelyWithTimeout } from './utils/responseEnd.js';

/**
 * Wraps a Next.js Server Action implementation with Sentry Error and Performance instrumentation.
 */
function withServerActionInstrumentation(
  ...args
) {
  if (typeof args[1] === 'function') {
    const [serverActionName, callback] = args;
    return withServerActionInstrumentationImplementation(serverActionName, {}, callback);
  } else {
    const [serverActionName, options, callback] = args;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return withServerActionInstrumentationImplementation(serverActionName, options, callback);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function withServerActionInstrumentationImplementation(
  serverActionName,
  options,
  callback,
) {
  return withIsolationScope(async isolationScope => {
    const sendDefaultPii = _optionalChain([getClient, 'call', _ => _(), 'optionalAccess', _2 => _2.getOptions, 'call', _3 => _3(), 'access', _4 => _4.sendDefaultPii]);

    let sentryTraceHeader;
    let baggageHeader;
    const fullHeadersObject = {};
    try {
      const awaitedHeaders = await options.headers;
      sentryTraceHeader = _nullishCoalesce(_optionalChain([awaitedHeaders, 'optionalAccess', _5 => _5.get, 'call', _6 => _6('sentry-trace')]), () => ( undefined));
      baggageHeader = _optionalChain([awaitedHeaders, 'optionalAccess', _7 => _7.get, 'call', _8 => _8('baggage')]);
      _optionalChain([awaitedHeaders, 'optionalAccess', _9 => _9.forEach, 'call', _10 => _10((value, key) => {
        fullHeadersObject[key] = value;
      })]);
    } catch (e) {
      DEBUG_BUILD &&
        logger.warn(
          "Sentry wasn't able to extract the tracing headers for a server action. Will not trace this request.",
        );
    }

    isolationScope.setTransactionName(`serverAction/${serverActionName}`);
    isolationScope.setSDKProcessingMetadata({
      normalizedRequest: {
        headers: fullHeadersObject,
      } ,
    });

    // Normally, there is an active span here (from Next.js OTEL) and we just use that as parent
    // Else, we manually continueTrace from the incoming headers
    const continueTraceIfNoActiveSpan = getActiveSpan()
      ? (_opts, callback) => callback()
      : continueTrace;

    return continueTraceIfNoActiveSpan(
      {
        sentryTrace: sentryTraceHeader,
        baggage: baggageHeader,
      },
      async () => {
        try {
          return await startSpan(
            {
              op: 'function.server_action',
              name: `serverAction/${serverActionName}`,
              forceTransaction: true,
              attributes: {
                [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'route',
              },
            },
            async span => {
              const result = await handleCallbackErrors(callback, error => {
                if (isNotFoundNavigationError(error)) {
                  // We don't want to report "not-found"s
                  span.setStatus({ code: SPAN_STATUS_ERROR, message: 'not_found' });
                } else if (isRedirectNavigationError(error)) {
                  // Don't do anything for redirects
                } else {
                  span.setStatus({ code: SPAN_STATUS_ERROR, message: 'internal_error' });
                  captureException(error, {
                    mechanism: {
                      handled: false,
                    },
                  });
                }
              });

              if (options.recordResponse !== undefined ? options.recordResponse : sendDefaultPii) {
                getIsolationScope().setExtra('server_action_result', result);
              }

              if (options.formData) {
                options.formData.forEach((value, key) => {
                  getIsolationScope().setExtra(
                    `server_action_form_data.${key}`,
                    typeof value === 'string' ? value : '[non-string value]',
                  );
                });
              }

              return result;
            },
          );
        } finally {
          vercelWaitUntil(flushSafelyWithTimeout());
        }
      },
    );
  });
}

export { withServerActionInstrumentation };
//# sourceMappingURL=withServerActionInstrumentation.js.map
