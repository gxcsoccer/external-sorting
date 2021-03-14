'use strict';

const debug = require('debug')('externalSort');
const os = require('os');
const readline = require('readline');
const HeapNode = require('./heap_node');
const { initHeap, heapify } = require('./heapify');
const { writeToTempFile, searchInsert } = require('./utils');

const ONE_GB = 1024 * 1024 * 1024;
const defaultOptions = {
  maxHeap: ONE_GB,
  tempDir: os.tmpdir(),
  serializer: num => num + '\n',
  deserializer: line => (line ? Number(line.trim()) : null),
  comparer: (a, b) => (a - b),
};

/**
 * 外排序实现
 *
 * @param {Readable}   input    输入的流
 * @param {Writable}   output   输出的流
 * @param {Object}     options
 *  - {Number} maxHeap 内存排序的上限，超过需要借助文件
 *  - {String} tempDir 临时文件目录
 *  - {Function} serializer 回写文件时的函数
 *  - {Function} deserializer 处理一行输入的函数
 *  - {Function} comparer 排序的比较函数
 * @return     {Promise}  { void }
 */
async function externalSort(input, output, options) {
  const { maxHeap, tempDir, serializer, deserializer, comparer } = Object.assign({}, defaultOptions, options);
  const rl = readline.createInterface({
    input,
  });

  let size = 0;
  let arr = [];
  let fileCount = 0;
  const files = [];

  for await (const line of rl) {
    debug(`Line from file: ${line}`);
    const len = Buffer.byteLength(line, 'utf8');
    size += len;
    const item = deserializer(line);

    if (size >= maxHeap) {
      files.push(await writeToTempFile(arr, tempDir, fileCount, serializer));
      fileCount += 1;
      size = len;
      arr = [ item ];
    } else {
      searchInsert(arr, item, comparer);
    }
  }

  if (arr.length) {
    files.push(await writeToTempFile(arr, tempDir, fileCount, serializer));
  }

  const harr = await Promise.all(files.map(async file => {
    const node = new HeapNode(file, {
      deserializer,
    });
    await node.nextLine();
    return node;
  }));

  initHeap(harr, comparer);

  let first;
  do {
    first = harr[0];
    if (!first || first.item == null) break;

    output.write(`${serializer(first.item)}`);

    await first.nextLine();
    heapify(harr, 0, harr.length, comparer);
  } while (first && first.item != null);

  return new Promise(resolve => {
    output.once('close', resolve);
    output.end();
  });
}

module.exports = externalSort;
