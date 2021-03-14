'use strict';

const path = require('path');
const fs = require('fs').promises;
const mkdirp = require('mz-modules/mkdirp');

function findInsertPos(arr, item, comparer) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (comparer(arr[mid], item) === 0) {
      return mid;
    } else if (comparer(arr[mid], item) > 0) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return left;
}

function searchInsert(arr, item, comparer) {
  const pos = findInsertPos(arr, item, comparer);
  arr.splice(pos, 0, item);
}

exports.searchInsert = searchInsert;

async function writeToTempFile(arr, tempDir, index, serializer) {
  await mkdirp(tempDir);
  const tempFile = path.join(tempDir, `external-sort.${index}`);
  await fs.writeFile(tempFile, arr.map(serializer).join(''));
  return tempFile;
}

exports.writeToTempFile = writeToTempFile;
