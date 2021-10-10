const truffleAssert = require('truffle-assertions');

const Escrow = artifacts.require('Escrow');
const ERC20 = artifacts.require('IERC20');
const Uniswap = artifacts.require('IUniswapRouterV2');

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

let escrow;
let usdc;
let router;

const buyUsdc = async (address) => {
  await router.swapExactETHForTokens(
    '1',
    [WETH, USDC],
    address,
    '9999999999999999',
    { from: address, value: '1000000000000000000' }
  );
};

beforeEach(async () => {
  escrow = await Escrow.deployed();
  usdc = await ERC20.at(USDC);
  router = await Uniswap.at('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
});

contract('Escrow', (accounts) => {
  const owner = accounts[0];
  const client = accounts[1];
  const dev = accounts[2];
  const amount = 1000;

  it('contract deployed successfully', () => {
    assert.ok(escrow.address);
    assert.ok(usdc.address);
  });

  it('create new transaction successfully', async () => {
    let tx = await escrow.createTransaction(client, dev, usdc.address, amount);
    let event = tx.logs[0].args['0'];
    assert.strictEqual(event.buyer, client);
    assert.strictEqual(event.seller, dev);
    assert.strictEqual(event.token, usdc.address);
    assert.strictEqual(event.buyerStake, '0');
    assert.strictEqual(event.sellerStake, '0');
    assert.strictEqual(event.buyerState, false);
    assert.strictEqual(event.sellerState, true);
  });

  it('Inactive transaction tests', async () => {
    let id = await setup();
    // b/s must not be able to change states while transaction is inactive
    await truffleAssert.reverts(
      escrow.changeMyState(id, true, { from: client }),
      'Not Active'
    );

    await activateTransaction(client, amount, id);

    // transaction must still be inactive
    tx = await escrow.transactions(id);
    assert.strictEqual('0', tx.state.toString());

    // withdrawals success while transaction is inactive
    let prev = await tokenBalance(client);

    await escrow.withdrawAll(id, { from: client });

    assert((await tokenBalance(client)) > prev);
  });

  it('Active & Successful Transaction Tests', async () => {
    let id = await setup();

    await activateTransaction(client, amount * 2, id);

    // transaction must still be inactive
    await assertState(id, 0);

    await activateTransaction(dev, amount, id);
    // transaction must be active now
    await assertState(id, 1);

    // no withdrawal in active transaction
    await truffleAssert.reverts(
      escrow.withdrawAll(id, { from: client }),
      'Transaction Active!'
    );

    await truffleAssert.reverts(
      escrow.changeMyState(id, true, { from: owner }),
      'Not buyer or seller'
    );

    // transaction must be successfull
    await escrow.changeMyState(id, true, { from: client });
    await assertState(id, 2);

    // withdrawals

    let clientPrev = await tokenBalance(client);
    await escrow.withdrawAll(id, { from: client });
    let clientNew = await tokenBalance(client);
    assert(clientNew > clientPrev);

    let devPrev = await tokenBalance(dev);
    await escrow.withdrawAll(id, { from: dev });
    let devNew = await tokenBalance(dev);
    assert(devNew > devPrev);

    assert(devNew - devPrev == 2 * (clientNew - clientPrev));
  });

  it('Failed Transaction Tests', async () => {
    let id = await setup();

    await activateTransaction(client, amount * 2, id);

    await activateTransaction(dev, amount, id);
    // transaction must still be inactive
    await assertState(id, 1);

    // transaction must be cancelled
    await escrow.changeMyState(id, false, { from: dev });
    await assertState(id, 3);

    // withdrawals for cancelled transaction
    let clientPrev = await tokenBalance(client);
    await escrow.withdrawAll(id, { from: client });
    let clientNew = await tokenBalance(client);
    assert(clientNew > clientPrev);

    let devPrev = await tokenBalance(dev);
    await escrow.withdrawAll(id, { from: dev });
    let devNew = await tokenBalance(dev);
    assert(devNew > devPrev);

    assert(2 * (devNew - devPrev) == clientNew - clientPrev);
  });

  it('Withdrawal security tests', async () => {
    let id = await setup();

    await activateTransaction(client, amount * 2, id);

    await activateTransaction(dev, amount, id);
    // transaction must still be inactive
    await assertState(id, 1);

    // transaction must be cancelled
    await escrow.changeMyState(id, true, { from: client });
    await assertState(id, 2);

    // withdrawal
    await escrow.withdrawAll(id, { from: client });
    await escrow.withdrawAll(id, { from: dev });

    // must not be able to withdraw twice for same id
    await truffleAssert.reverts(escrow.withdrawAll(id, { from: client }));
    await truffleAssert.reverts(escrow.withdrawAll(id, { from: dev }));

    // should not be able to active successful transaction again
    await truffleAssert.reverts(
      escrow.activateTransaction(id, amount, dev, { from: dev }),
      'Must be Inactive'
    );
  });

  const setup = async () => {
    await buyUsdc(client);
    await buyUsdc(dev);
    let tx = await escrow.createTransaction(client, dev, usdc.address, amount);

    return tx.logs[0].args['0'].id;
  };
});

const tokenBalance = async (address) => {
  return await usdc.balanceOf(address);
};

const activateTransaction = async (address, amt, id) => {
  await usdc.approve(escrow.address, amt, { from: address });
  await escrow.activateTransaction(id, amt.toString(), address, {
    from: address,
  });
};

const assertState = async (id, state) => {
  let tx = await escrow.transactions(id);
  assert.strictEqual(state.toString(), tx.state.toString());
};
