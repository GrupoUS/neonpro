import { D as Devtools } from './ReactQueryDevtools-DO8QvfQP.cjs';
import { D as DevtoolsPanel } from './ReactQueryDevtoolsPanel-BAUD7o3r.cjs';
import 'react';
import '@tanstack/query-devtools';
import '@tanstack/react-query';

declare const ReactQueryDevtools: (typeof Devtools)['ReactQueryDevtools'];
declare const ReactQueryDevtoolsPanel: (typeof DevtoolsPanel)['ReactQueryDevtoolsPanel'];

export { ReactQueryDevtools, ReactQueryDevtoolsPanel };
