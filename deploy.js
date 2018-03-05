const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const { mnemonic, infura } = require('./secret');

// specify provider w/ mnemonic on rinkeby network
const provider = new HDWalletProvider(mnemonic, infura);
// create instance of web3 w/ provider
const web3 = new Web3(provider);

// gas amount and price
const GAS = 400000;
const GWEI = 1000000000;
const GAS_PRICE = 50*GWEI;

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account: ', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode
    })
    .send({ gas: GAS, gasPrice: GAS_PRICE, from: accounts[0] });

  console.log('Contract deployed to: ', result.options.address);
};

deploy();
