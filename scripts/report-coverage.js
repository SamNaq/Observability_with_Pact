#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: '.env.cloud' });

const suite = process.argv[2] || 'unknown';
const metric = process.argv[3] || 'lines';

const coverageDir = path.resolve(process.cwd(), 'coverage', suite);
const summaryPath = path.join(coverageDir, 'coverage-summary.json');

if (!fs.existsSync(summaryPath)) {
  console.warn(`[coverage] No coverage summary found at ${summaryPath}. Skipping coverage reporting.`);
  process.exit(0);
}

let summary;
try {
  summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
} catch (error) {
  console.warn('[coverage] Unable to parse coverage summary file:', error.message);
  process.exit(0);
}

const coverageMetric = summary?.total?.[metric];

if (!coverageMetric) {
  console.warn(`[coverage] Coverage metric "${metric}" not found in summary. Skipping.`);
  process.exit(0);
}

let coveragePct = coverageMetric.pct;

if (typeof coveragePct !== 'number') {
  const covered = Number(coverageMetric.covered);
  const total = Number(coverageMetric.total);
  coveragePct = Number.isFinite(covered) && total > 0 ? (covered / total) * 100 : 0;
}

coveragePct = Number(coveragePct);

const endpoint = process.env.PACT_METRICS_URL || 'http://localhost:3001/internal/metrics/test-coverage';

axios
  .post(
    endpoint,
    {
      suite,
      metric,
      value: coveragePct,
    },
    { timeout: 2000 }
  )
  .then(() => {
    console.log(`[coverage] Reported ${metric} coverage for suite "${suite}" (${coveragePct}%) to ${endpoint}`);
  })
  .catch((error) => {
    console.warn('[coverage] Unable to report coverage metric:', error?.message || error);
  });

