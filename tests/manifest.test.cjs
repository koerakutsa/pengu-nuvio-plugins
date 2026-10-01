const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('all working stream providers remain in the install manifest', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const enabled = manifest.scrapers.filter((provider) => provider.enabled);
  const ids = enabled.map((provider) => provider.id);
  assert.deepEqual(ids, [
    'duoplay', 'err-jupiter', 'vidzee', 'vidrock',
    'vixsrc', 'playimdb',
  ]);

  for (const provider of manifest.scrapers) {
    assert.ok(fs.existsSync(provider.filename), provider.filename);
    assert.ok(provider.supportedTypes.includes('series'), provider.id);
    new vm.Script(fs.readFileSync(provider.filename, 'utf8'), {
      filename: provider.filename,
    });
  }
});
