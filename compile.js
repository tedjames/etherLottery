/*  Contract Compiler  */
/*  Returns bytecode and ABI as: { bytecode, interface }  */

const path = require('path');
const fs = require('fs');

// import solidity compiler
const solc = require('solc');

// path to contracts
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

// compile contracts
module.exports = solc.compile(source, 1).contracts[':Lottery'];
