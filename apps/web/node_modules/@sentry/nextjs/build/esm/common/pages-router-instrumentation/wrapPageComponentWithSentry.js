import { _optionalChain } from '@sentry/core';
import { withIsolationScope, getCurrentScope, extractTraceparentData, captureException } from '@sentry/core';

function isReactClassComponent(target) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof target === 'function' && _optionalChain([target, 'optionalAccess', _ => _.prototype, 'optionalAccess', _2 => _2.isReactComponent]);
}

/**
 * Wraps a page component with Sentry error instrumentation.
 */
function wrapPageComponentWithSentry(pageComponent) {
  if (isReactClassComponent(pageComponent)) {
    return class SentryWrappedPageComponent extends pageComponent {
       render(...args) {
        return withIsolationScope(() => {
          const scope = getCurrentScope();
          // We extract the sentry trace data that is put in the component props by datafetcher wrappers
          const sentryTraceData =
            typeof this.props === 'object' &&
            this.props !== null &&
            '_sentryTraceData' in this.props &&
            typeof this.props._sentryTraceData === 'string'
              ? this.props._sentryTraceData
              : undefined;

          if (sentryTraceData) {
            const traceparentData = extractTraceparentData(sentryTraceData);
            scope.setContext('trace', {
              span_id: _optionalChain([traceparentData, 'optionalAccess', _3 => _3.parentSpanId]),
              trace_id: _optionalChain([traceparentData, 'optionalAccess', _4 => _4.traceId]),
            });
          }

          try {
            return super.render(...args);
          } catch (e) {
            captureException(e, {
              mechanism: {
                handled: false,
              },
            });
            throw e;
          }
        });
      }
    };
  } else if (typeof pageComponent === 'function') {
    return new Proxy(pageComponent, {
      apply(target, thisArg, argArray) {
        return withIsolationScope(() => {
          const scope = getCurrentScope();
          // We extract the sentry trace data that is put in the component props by datafetcher wrappers
          const sentryTraceData = _optionalChain([argArray, 'optionalAccess', _5 => _5[0], 'optionalAccess', _6 => _6._sentryTraceData]);

          if (sentryTraceData) {
            const traceparentData = extractTraceparentData(sentryTraceData);
            scope.setContext('trace', {
              span_id: _optionalChain([traceparentData, 'optionalAccess', _7 => _7.parentSpanId]),
              trace_id: _optionalChain([traceparentData, 'optionalAccess', _8 => _8.traceId]),
            });
          }

          try {
            return target.apply(thisArg, argArray);
          } catch (e) {
            captureException(e, {
              mechanism: {
                handled: false,
              },
            });
            throw e;
          }
        });
      },
    });
  } else {
    return pageComponent;
  }
}

export { wrapPageComponentWithSentry };
//# sourceMappingURL=wrapPageComponentWithSentry.js.map
