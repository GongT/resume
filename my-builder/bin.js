#!/usr/bin/env -S node --enable-source-maps

import { dirname } from 'path';
process.chdir(dirname(import.meta.dirname));

import 'source-map-support/register.js';
import('./lib/esbuild.js');
