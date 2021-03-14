'use strict';

const fs = require('fs');
const readline = require('readline');
const awaitFirst = require('await-first');

const defaultOptions = {
  highWaterMark: 64 * 1024,
  deserializer: line => line,
};

class HeapNode {
  constructor(file, options) {
    this._options = Object.assign({}, defaultOptions, options);
    this._input = fs.createReadStream(file, { highWaterMark: this._options.highWaterMark });
    this._rl = readline.createInterface({
      input: this._input,
    });
    this._isEnd = false;
    this._cache = [];
    this._item = null;

    this._rl.on('line', line => {
      this._cache.push(line);
      if (!this._input.isPaused()) {
        this._input.pause();
      }
    });
    this._rl.once('close', () => {
      this._isEnd = true;
    });
  }

  get item() {
    return this._item;
  }

  async nextLine() {
    if (this._cache.length) {
      const line = this._cache.shift();
      this._item = this._options.deserializer(line);
      return line;
    } else if (this._isEnd) {
      this._item = null;
      return null;
    }

    this._input.resume();
    await awaitFirst(this._rl, [ 'line', 'close' ]);
    return this.nextLine();
  }
}

module.exports = HeapNode;
