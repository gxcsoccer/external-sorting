'use strict';

const fs = require('fs');
const mm = require('mm');
const path = require('path');
const assert = require('assert');
const rimraf = require('mz-modules/rimraf');
const externalSort = require('../lib');

describe('test/index.test.js', () => {
  afterEach(mm.restore);

  it('should external sort ok', async () => {
    const outputFile = path.join(__dirname, 'fixtures/output.txt');
    await rimraf(outputFile);

    const input = fs.createReadStream(path.join(__dirname, 'fixtures/input.txt'));
    const output = fs.createWriteStream(outputFile);
    await externalSort(input, output);
    assert(fs.existsSync(outputFile));

    const data = fs.readFileSync(outputFile, 'utf8');
    console.log(data);
    assert(data === `1570593273486
1570593273486
1570593273487
1570593273487
1570593273488
1570593273488
1570593273489
1570593273492
1570593273493
1570593273494
1570593273494
`);

    await rimraf(outputFile);
  });

  it('should external sort with maxHeap=100', async () => {
    const inputFile = path.join(__dirname, 'fixtures/100_int.txt');
    const outputFile = path.join(__dirname, 'fixtures/100_int_output.txt');
    const tempDir = path.join(__dirname, 'fixtures/tmp');
    await rimraf(outputFile);

    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);
    await externalSort(input, output, {
      maxHeap: 100,
      tempDir,
    });
    assert(fs.existsSync(outputFile));

    const data = fs.readFileSync(outputFile, 'utf8').split('\n')
      .filter(item => !item)
      .map(item => Number(item.trim()));

    const expect = fs.readFileSync(inputFile, 'utf8').split('\n')
      .filter(item => !item)
      .map(item => Number(item.trim()))
      .sort();

    assert.deepEqual(data, expect);
    assert(fs.existsSync(path.join(tempDir, 'external-sort.0')));
    assert(fs.existsSync(path.join(tempDir, 'external-sort.1')));
    assert(fs.existsSync(path.join(tempDir, 'external-sort.2')));
    assert(fs.existsSync(path.join(tempDir, 'external-sort.3')));

    await rimraf(outputFile);
    await rimraf(tempDir);
  });
});
