/**
 * T060 — architecture invariant (Constitution Principle IX): screens and feature code must
 * import repositories only via the registry (`@/repositories`) or the contracts, never a
 * concrete `mock/` or `api/` implementation directly. This keeps Mock↔API swappable with zero
 * screen changes. Fails if any app/ or feature file reaches into an implementation folder.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOTS = ['app', 'src/features', 'src/stores'];
const FORBIDDEN = /from ['"]@\/repositories\/(mock|api)\//;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

it('no screen/feature/store imports a concrete repository implementation directly', () => {
  const offenders: string[] = [];
  for (const root of ROOTS) {
    let files: string[] = [];
    try {
      files = walk(root);
    } catch {
      continue;
    }
    for (const f of files) {
      if (FORBIDDEN.test(readFileSync(f, 'utf8'))) offenders.push(f);
    }
  }
  expect(offenders).toEqual([]);
});
