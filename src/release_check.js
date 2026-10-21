const REQUIRED_AREAS = ['customerImpact', 'orders', 'data', 'tests', 'rollback'];

export function validateRelease(release) {
  const errors = [];
  if (!release || typeof release !== 'object') return ['release must be an object'];
  if (!release.name) errors.push('name is required');
  for (const area of REQUIRED_AREAS) {
    if (!release[area]) errors.push(`${area} is required`);
  }
  if (release.tests && (!Array.isArray(release.tests) || release.tests.length === 0)) errors.push('tests must be a non-empty array');
  return errors;
}

export function scoreRelease(release) {
  const errors = validateRelease(release);
  const tests = release.tests || [];
  const failed = tests.filter((test) => test.status === 'failed').length;
  const pending = tests.filter((test) => test.status !== 'passed').length;
  return {
    ready: errors.length === 0 && failed === 0 && pending === 0,
    errors,
    metrics: { areas: REQUIRED_AREAS.filter((area) => Boolean(release[area])).length, tests: tests.length, failed, pending }
  };
}
