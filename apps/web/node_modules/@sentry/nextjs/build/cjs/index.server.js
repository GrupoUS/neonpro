Object.defineProperty(exports, '__esModule', { value: true });

const withSentryConfig = require('./config/withSentryConfig.js');
const index = require('./server/index.js');
const _error = require('./common/pages-router-instrumentation/_error.js');
const wrapApiHandlerWithSentry = require('./common/pages-router-instrumentation/wrapApiHandlerWithSentry.js');
const wrapGetStaticPropsWithSentry = require('./common/pages-router-instrumentation/wrapGetStaticPropsWithSentry.js');
const wrapGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapGetInitialPropsWithSentry.js');
const wrapAppGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapAppGetInitialPropsWithSentry.js');
const wrapDocumentGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapDocumentGetInitialPropsWithSentry.js');
const wrapErrorGetInitialPropsWithSentry = require('./common/pages-router-instrumentation/wrapErrorGetInitialPropsWithSentry.js');
const wrapGetServerSidePropsWithSentry = require('./common/pages-router-instrumentation/wrapGetServerSidePropsWithSentry.js');
const wrapServerComponentWithSentry = require('./common/wrapServerComponentWithSentry.js');
const wrapRouteHandlerWithSentry = require('./common/wrapRouteHandlerWithSentry.js');
const wrapApiHandlerWithSentryVercelCrons = require('./common/pages-router-instrumentation/wrapApiHandlerWithSentryVercelCrons.js');
const wrapMiddlewareWithSentry = require('./common/wrapMiddlewareWithSentry.js');
const wrapPageComponentWithSentry = require('./common/pages-router-instrumentation/wrapPageComponentWithSentry.js');
const wrapGenerationFunctionWithSentry = require('./common/wrapGenerationFunctionWithSentry.js');
const withServerActionInstrumentation = require('./common/withServerActionInstrumentation.js');
const captureRequestError = require('./common/captureRequestError.js');
const node = require('@sentry/node');



exports.withSentryConfig = withSentryConfig.withSentryConfig;
exports.ErrorBoundary = index.ErrorBoundary;
exports.createReduxEnhancer = index.createReduxEnhancer;
exports.init = index.init;
exports.showReportDialog = index.showReportDialog;
exports.withErrorBoundary = index.withErrorBoundary;
exports.captureUnderscoreErrorException = _error.captureUnderscoreErrorException;
exports.wrapApiHandlerWithSentry = wrapApiHandlerWithSentry.wrapApiHandlerWithSentry;
exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry.wrapGetStaticPropsWithSentry;
exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry.wrapGetInitialPropsWithSentry;
exports.wrapAppGetInitialPropsWithSentry = wrapAppGetInitialPropsWithSentry.wrapAppGetInitialPropsWithSentry;
exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry.wrapDocumentGetInitialPropsWithSentry;
exports.wrapErrorGetInitialPropsWithSentry = wrapErrorGetInitialPropsWithSentry.wrapErrorGetInitialPropsWithSentry;
exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry.wrapGetServerSidePropsWithSentry;
exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry.wrapServerComponentWithSentry;
exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry.wrapRouteHandlerWithSentry;
exports.wrapApiHandlerWithSentryVercelCrons = wrapApiHandlerWithSentryVercelCrons.wrapApiHandlerWithSentryVercelCrons;
exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry.wrapMiddlewareWithSentry;
exports.wrapPageComponentWithSentry = wrapPageComponentWithSentry.wrapPageComponentWithSentry;
exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry.wrapGenerationFunctionWithSentry;
exports.withServerActionInstrumentation = withServerActionInstrumentation.withServerActionInstrumentation;
exports.captureRequestError = captureRequestError.captureRequestError;
exports.experimental_captureRequestError = captureRequestError.experimental_captureRequestError;
Object.prototype.hasOwnProperty.call(node, '__proto__') &&
	!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
	Object.defineProperty(exports, '__proto__', {
		enumerable: true,
		value: node['__proto__']
	});

Object.keys(node).forEach(k => {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = node[k];
});
//# sourceMappingURL=index.server.js.map
