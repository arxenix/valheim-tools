exports.onClientEntry = () => {
    window.Buffer = require('buffer/').Buffer;
    //global.Buffer = window.Buffer;

    // hotfix polyfill to be able to write longs
    Buffer.prototype.writeBigUInt64LE = function(value, offset) {
        if (!offset) {
            offset = 0
        }
        const upper = value >> 32n
        const lower = window.BigInt.asUintN(32, value)
        this.writeUInt32LE(Number(lower), offset)
        this.writeUInt32LE(Number(upper), offset + 4)
    }

    // hotfix to make binary-parser work w/ feross/buffer polyfill
    // Buffer.subarray() normally returns a Uint8Array instead of a node Buffer, patch that.
    Buffer.prototype.subarray = function(begin, end) {
        const sub = Uint8Array.prototype.subarray.call(this, begin, end)
        return Buffer.from(sub)
    }

};