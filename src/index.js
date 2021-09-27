"use strict";
var sha256 = require('crypto-js/sha256');
console.log("Hello ", sha256("world").toString());
var Block = /** @class */ (function () {
    function Block(index, timeStamp, transactions, previousHash) {
        if (previousHash === void 0) { previousHash = ""; }
        this.index = index;
        this.timeStamp = timeStamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
    }
    return Block;
}());
