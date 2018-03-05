const assert = require('assert');
const ganache = require('ganache-cli');
const provider = ganache.provider();
const Web3 = require('web3');

const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
  lottery.setProvider(provider);
});

describe('Lottery contract', () => {

  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });
    lottery.setProvider(web3.currentProvider);
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });
  it('requires a minimum amount of ether to enter', async () => {
    try {
      // attempt to enter with only 10 wei (min is 0.01 ether)
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 10
      });
      // throw error if submission is accepted
      assert(false);
    } catch (e) {
      // pass the test if an error is returned
      assert(e);
    }
  });
  it('only manager can call pickWinner()', async () => {
    try {
      // attempt to enter not as manager
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      assert(false);
    } catch (e) {
      // pass the test if an error is returned
      assert(e);
    }
  });
  it('sends money to winner', async () => {
    // enter into the lottery
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    })
    // get initial balance
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    // pick a winner
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    // get final balance
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    // make sure difference is greater than 0.8 (amount sent - est. cost of gas)
    const difference = finalBalance - initialBalance;
    assert(difference > web3.utils.toWei('0.8', 'ether'));
  });
  it('players array is emptied after running pickWinner()', async () => {
    // enter the lottery
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })
    // pick a winner
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    // get the list of new players
    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
    // pass the test if players array is empty
    assert.equal(0, players.length);
  });
  it('contract balance is zero after running pickWinner()', async () => {
    // enter the lottery
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })
    // pick a winner
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    // get contract address and balance
    const contractAddress = await lottery.options.address;
    const contractBalance = await web3.eth.getBalance(contractAddress);
    // pass test if balance is zero
    assert(contractBalance == 0);
  })
});
