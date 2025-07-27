var {
  _nullishCoalesce,
  _optionalChain
} = require('@sentry/core');

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@sentry/core');
const stackTraceParser = require('stacktrace-parser');

const globalWithInjectedValues = core.GLOBAL_OBJ

;

async function resolveStackFrame(
  frame,
  error,
) {
  try {
    if (!(_optionalChain([frame, 'access', _ => _.file, 'optionalAccess', _2 => _2.startsWith, 'call', _3 => _3('webpack-internal:')]) || _optionalChain([frame, 'access', _4 => _4.file, 'optionalAccess', _5 => _5.startsWith, 'call', _6 => _6('file:')]))) {
      return null;
    }

    const params = new URLSearchParams();
    params.append('isServer', String(false)); // doesn't matter since it is overwritten by isAppDirectory
    params.append('isEdgeServer', String(false)); // doesn't matter since it is overwritten by isAppDirectory
    params.append('isAppDirectory', String(true)); // will force server to do more thorough checking
    params.append('errorMessage', error.toString());
    Object.keys(frame).forEach(key => {
      params.append(key, (_nullishCoalesce(frame[key ], () => ( ''))).toString());
    });

    let basePath = _nullishCoalesce(_nullishCoalesce(process.env._sentryBasePath, () => ( globalWithInjectedValues._sentryBasePath)), () => ( ''));

    // Prefix the basepath with a slash if it doesn't have one
    if (basePath !== '' && !basePath.match(/^\//)) {
      basePath = `/${basePath}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await core.suppressTracing(() =>
      fetch(
        `${
          // eslint-disable-next-line no-restricted-globals
          typeof window === 'undefined' ? 'http://localhost:3000' : '' // TODO: handle the case where users define a different port
        }${basePath}/__nextjs_original-stack-frame?${params.toString()}`,
        {
          signal: controller.signal,
        },
      ).finally(() => {
        clearTimeout(timer);
      }),
    );

    if (!res.ok || res.status === 204) {
      return null;
    }

    const body = await res.json();

    return {
      originalCodeFrame: body.originalCodeFrame,
      originalStackFrame: body.originalStackFrame,
    };
  } catch (e) {
    return null;
  }
}

function parseOriginalCodeFrame(codeFrame)

 {
  const preProcessedLines = codeFrame
    // Remove ASCII control characters that are used for syntax highlighting
    .replace(
      // eslint-disable-next-line no-control-regex
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, // https://stackoverflow.com/a/29497680
      '',
    )
    .split('\n')
    // Remove line that is supposed to indicate where the error happened
    .filter(line => !line.match(/^\s*\|/))
    // Find the error line
    .map(line => ({
      line,
      isErrorLine: !!line.match(/^>/),
    }))
    // Remove the leading part that is just for prettier output
    .map(lineObj => ({
      ...lineObj,
      line: lineObj.line.replace(/^.*\|/, ''),
    }));

  const preContextLines = [];
  let contextLine = undefined;
  const postContextLines = [];

  let reachedContextLine = false;

  for (const preProcessedLine of preProcessedLines) {
    if (preProcessedLine.isErrorLine) {
      contextLine = preProcessedLine.line;
      reachedContextLine = true;
    } else if (reachedContextLine) {
      postContextLines.push(preProcessedLine.line);
    } else {
      preContextLines.push(preProcessedLine.line);
    }
  }

  return {
    contextLine,
    preContextLines,
    postContextLines,
  };
}

/**
 * Event processor that will symbolicate errors by using the webpack/nextjs dev server that is used to show stack traces
 * in the dev overlay.
 */
async function devErrorSymbolicationEventProcessor(event, hint) {
  // Filter out spans for requests resolving source maps for stack frames in dev mode
  if (event.type === 'transaction') {
    event.spans = _optionalChain([event, 'access', _7 => _7.spans, 'optionalAccess', _8 => _8.filter, 'call', _9 => _9(span => {
      const httpUrlAttribute = _optionalChain([span, 'access', _10 => _10.data, 'optionalAccess', _11 => _11['http.url']]);
      if (typeof httpUrlAttribute === 'string') {
        return !httpUrlAttribute.includes('__nextjs_original-stack-frame');
      }

      return true;
    })]);
  }

  // Due to changes across Next.js versions, there are a million things that can go wrong here so we just try-catch the  // entire event processor.Symbolicated stack traces are just a nice to have.
  try {
    if (hint.originalException && hint.originalException instanceof Error && hint.originalException.stack) {
      const frames = stackTraceParser.parse(hint.originalException.stack);

      const resolvedFrames = await Promise.all(
        frames.map(frame => resolveStackFrame(frame, hint.originalException )),
      );

      if (_optionalChain([event, 'access', _12 => _12.exception, 'optionalAccess', _13 => _13.values, 'optionalAccess', _14 => _14[0], 'optionalAccess', _15 => _15.stacktrace, 'optionalAccess', _16 => _16.frames])) {
        event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames.map(
          (frame, i, frames) => {
            const resolvedFrame = resolvedFrames[frames.length - 1 - i];
            if (!resolvedFrame || !resolvedFrame.originalStackFrame || !resolvedFrame.originalCodeFrame) {
              return {
                ...frame,
                platform: _optionalChain([frame, 'access', _17 => _17.filename, 'optionalAccess', _18 => _18.startsWith, 'call', _19 => _19('node:internal')]) ? 'nodejs' : undefined, // simple hack that will prevent a source mapping error from showing up
                in_app: false,
              };
            }

            const { contextLine, preContextLines, postContextLines } = parseOriginalCodeFrame(
              resolvedFrame.originalCodeFrame,
            );

            return {
              ...frame,
              pre_context: preContextLines,
              context_line: contextLine,
              post_context: postContextLines,
              function: resolvedFrame.originalStackFrame.methodName,
              filename: resolvedFrame.originalStackFrame.file || undefined,
              lineno: resolvedFrame.originalStackFrame.lineNumber || undefined,
              colno: resolvedFrame.originalStackFrame.column || undefined,
            };
          },
        );
      }
    }
  } catch (e) {
    return event;
  }

  return event;
}

exports.devErrorSymbolicationEventProcessor = devErrorSymbolicationEventProcessor;
//# sourceMappingURL=devErrorSymbolicationEventProcessor.js.map
