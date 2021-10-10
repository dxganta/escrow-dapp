const Escrow = artifacts.require('Escrow');

module.exports = (deployer) => {
  deployer.deploy(Escrow);
};
