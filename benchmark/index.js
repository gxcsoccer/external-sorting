'use strict';

const fs = require('fs');
const path = require('path');
const externalSort = require('../');
const cp = require('child_process');
const readline = require('readline');
const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const suite = new Benchmark.Suite();

const inputFile = path.join(__dirname, '../test/fixtures/100_int.txt');
const outputFile = path.join(__dirname, '100_int_output.txt');

const serializer = num => num + '\n';
const deserializer = line => (line ? Number(line.trim()) : null);
const comparer = (a, b) => (a - b);

async function simpleSort(input, output) {
  const rl = readline.createInterface({
    input,
  });
  const arr = [];
  for await (const line of rl) {
    const item = deserializer(line);
    arr.push(item);
  }
  arr.sort(comparer);

  for (const item of arr) {
    output.write(`${serializer(item)}`);
  }
  return new Promise(resolve => {
    output.once('close', resolve);
    output.end();
  });
}

function linuxSort(inputFile, outputFile) {
  cp.exec(`sort -S 100 -n ${inputFile} > ${outputFile}`);
}

suite
  .add('linuxSort 100 条数据', function() {
    linuxSort(inputFile, outputFile);
  })
  .add('simpleSort 100 条数据', {
    defer: true,
    fn(deferred) {
      const input = fs.createReadStream(inputFile);
      const output = fs.createWriteStream(outputFile);
      simpleSort(input, output).then(() => { deferred.resolve(); });
    },
  })
  .add('externalSort 100 条数据', {
    defer: true,
    fn(deferred) {
      const input = fs.createReadStream(inputFile);
      const output = fs.createWriteStream(outputFile);
      externalSort(input, output, {
        maxHeap: 100,
        serializer,
        deserializer,
        comparer,
      }).then(() => { deferred.resolve(); });
    },
  })
  .on('cycle', function(event) {
    benchmarks.add(event.target);
  })
  .on('start', function() {
    console.log('\n  node version: %s, date: %s\n  Starting...', process.version, Date());
  })
  .on('complete', function done() {
    benchmarks.log();
  })
  .run({ async: false });
