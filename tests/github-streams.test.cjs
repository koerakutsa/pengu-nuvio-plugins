const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

for (const entry of [
  { file: 'duoplay.js', id: 'duoplay:10142:ep:1', type: 'tv' },
  { file: 'err-jupiter.js', id: 'err:1609452232', type: 'movie' },
]) {
  test(`${entry.file} reads a custom-ID stream from the GitHub catalog`, async () => {
    const calls = [];
    const context = {
      module: { exports: {} },
      console: { log() {} },
      fetch: async (url) => {
        calls.push(url);
        return {
          ok: true,
          json: async () => ({ streams: [{
            name: 'GitHub', title: 'Fixture', url: 'https://media.example/master.m3u8',
            behaviorHints: { proxyHeaders: { request: { Referer: 'https://example.com/' } } },
          }] }),
        };
      },
    };
    vm.runInNewContext(fs.readFileSync(`providers/${entry.file}`, 'utf8'), context);
    const streams = await context.module.exports.getStreams(entry.id, entry.type);
    assert.equal(streams.length, 1);
    assert.equal(streams[0].url, 'https://media.example/master.m3u8');
    assert.equal(streams[0].headers.Referer, 'https://example.com/');
    assert.equal(calls.length, 1);
    assert.match(calls[0], /raw\.githubusercontent\.com\/koerakutsa\/pengu-catalogs\/main\/stream\//);
  });
}
