'use strict';

function swap(harr, a, b) {
  const temp = harr[a];
  harr[a] = harr[b];
  harr[b] = temp;
}

function heapify(harr, index, size, comparer) {
  const pos = index * 2;
  const left = pos + 1;
  const right = pos + 2;

  let first = index;

  if (left < size && harr[left].item !== null && comparer(harr[left].item, harr[first].item) < 0) {
    first = left;
  }

  if (right < size && harr[right].item !== null && comparer(harr[right].item, harr[first].item) < 0) {
    first = right;
  }

  if (first !== index) {
    swap(harr, index, first);
    heapify(harr, first, size, comparer);
  }
}

exports.heapify = heapify;

exports.initHeap = (harr, comparer) => {
  const heapSize = harr.length;
  let i = Math.floor((heapSize - 1) / 2);

  while (i >= 0) heapify(harr, i--, heapSize, comparer);
};
