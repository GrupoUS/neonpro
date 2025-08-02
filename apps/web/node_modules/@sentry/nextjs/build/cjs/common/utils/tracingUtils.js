var {
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const debugBuild = require('../debug-build.js');
const spanAttributesWithLogicAttached = require('../span-attributes-with-logic-attached.js');

const commonPropagationContextMap = new WeakMap();

/**
 * Takes a shared (garbage collectable) object between resources, e.g. a headers object shared between Next.js server components and returns a common propagation context.
 *
 * @param commonObject The shared object.
 * @param propagationContext The propagation context that should be shared between all the resources if no propagation context was registered yet.
 * @returns the shared propagation context.
 */
function commonObjectToPropagationContext(
  commonObject,
  propagationContext,
) {
  if (typeof commonObject === 'object' && commonObject) {
    const memoPropagationContext = commonPropagationContextMap.get(commonObject);
    if (memoPropagationContext) {
      return memoPropagationContext;
    } else {
      commonPropagationContextMap.set(commonObject, propagationContext);
      return propagationContext;
    }
  } else {
    return propagationContext;
  }
}

const commonIsolationScopeMap = new WeakMap();

/**
 * Takes a shared (garbage collectable) object between resources, e.g. a headers object shared between Next.js server components and returns a common propagation context.
 *
 * @param commonObject The shared object.
 * @param isolationScope The isolationScope that should be shared between all the resources if no isolation scope was created yet.
 * @returns the shared isolation scope.
 */
function commonObjectToIsolationScope(commonObject) {
  if (typeof commonObject === 'object' && commonObject) {
    const memoIsolationScope = commonIsolationScopeMap.get(commonObject);
    if (memoIsolationScope) {
      return memoIsolationScope;
    } else {
      const newIsolationScope = new core.Scope();
      commonIsolationScopeMap.set(commonObject, newIsolationScope);
      return newIsolationScope;
    }
  } else {
    return new core.Scope();
  }
}

let nextjsEscapedAsyncStorage;

/**
 * Will mark the execution context of the callback as "escaped" from Next.js internal tracing by unsetting the active
 * span and propagation context. When an execution passes through this function multiple times, it is a noop after the
 * first time.
 */
function escapeNextjsTracing(cb) {
  const MaybeGlobalAsyncLocalStorage = (core.GLOBAL_OBJ )
    .AsyncLocalStorage;

  if (!MaybeGlobalAsyncLocalStorage) {
    debugBuild.DEBUG_BUILD &&
      core.logger.warn(
        "Tried to register AsyncLocalStorage async context strategy in a runtime that doesn't support AsyncLocalStorage.",
      );
    return cb();
  }

  if (!nextjsEscapedAsyncStorage) {
    nextjsEscapedAsyncStorage = new MaybeGlobalAsyncLocalStorage();
  }

  if (nextjsEscapedAsyncStorage.getStore()) {
    return cb();
  } else {
    return core.startNewTrace(() => {
      return nextjsEscapedAsyncStorage.run(true, () => {
        return cb();
      });
    });
  }
}

/**
 * Ideally this function never lands in the develop branch.
 *
 * Drops the entire span tree this function was called in, if it was a span tree created by Next.js.
 */
function dropNextjsRootContext() {
  const nextJsOwnedSpan = core.getActiveSpan();
  if (nextJsOwnedSpan) {
    const rootSpan = core.getRootSpan(nextJsOwnedSpan);
    const rootSpanAttributes = core.spanToJSON(rootSpan).data;
    if (_optionalChain([rootSpanAttributes, 'optionalAccess', _ => _['next.span_type']])) {
      _optionalChain([core.getRootSpan, 'call', _2 => _2(nextJsOwnedSpan), 'optionalAccess', _3 => _3.setAttribute, 'call', _4 => _4(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION, true)]);
    }
  }
}

exports.commonObjectToIsolationScope = commonObjectToIsolationScope;
exports.commonObjectToPropagationContext = commonObjectToPropagationContext;
exports.dropNextjsRootContext = dropNextjsRootContext;
exports.escapeNextjsTracing = escapeNextjsTracing;
//# sourceMappingURL=tracingUtils.js.map
