'use strict';

const fs = require('fs');
const mm = require('mm');
const path = require('path');
const assert = require('assert');
const sleep = require('mz-modules/sleep');
const HeapNode = require('../lib/heap_node');

describe('test/heap_node.test.js', () => {
  afterEach(mm.restore);

  it('should call nextLine ok', async () => {
    const file = path.join(__dirname, 'fixtures/test.txt');
    const data = fs.readFileSync(file, 'utf8');
    const heapNode = new HeapNode(file, { highWaterMark: 20 });
    const arr = [];

    let line;
    do {
      line = await heapNode.nextLine();
      assert(line === heapNode.item);
      if (line != null) {
        arr.push(line);
      }
      await sleep(20);
    }
    while (line != null);

    const txt = arr.join('\n') + '\n';
    assert(txt === data);
  });
});
