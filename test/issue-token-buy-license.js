var PostLicense = artifacts.require("./PostLicense.sol");
var Board = artifacts.require("./Board.sol");
var LicensingToken = artifacts.require("./LicensingToken.sol");

const assertInvalidOpcode = require('./helpers/assertInvalidOpcode');

const ether = function(amount) {
  return web3.toWei(amount, 'ether');
}

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('Board', function(accounts) {
  var postLicense, board, token;

  it("creates a Board with an associated PostLicense", async function() {
    postLicense = await PostLicense.new();
    board = await Board.new(postLicense.address);
    assert.equal(await board.license(), postLicense.address);
  });

  it("prevents unlicensed addresses from posting", async function() {
    try {
      await board.post("Join my ICO @ 0x0000", {from: accounts[1]});
    } catch (error) {
      assertInvalidOpcode(error);
    }
  });

  it("sells a license for ETH", async function() {
    let ethPrice = await postLicense.getLicensePrice()
    await postLicense.buyLicenseForETH({from: accounts[1], value: ethPrice});
    let msg = "Join my ICO @ 0x0000";

    const {logs} = await board.post(msg, {from: accounts[1]});

    const event = logs.find(e => e.event === 'Post')

    should.exist(event)
    event.args.sender.should.equal(accounts[1])
    event.args.text.should.equal(msg)
  });

  it("creates a LicensingToken, accept 100 LIT as payment for a license", async function() {
    token = await LicensingToken.new();
    await postLicense.addAcceptedToken(token.address, 100, 80);
    await token.getTokens({from: accounts[2]});
    await token.approve(postLicense.address, 100, {from: accounts[2]});

    try {
      await board.post("Join my ICO @ 0x0000", {from: accounts[2]});
    } catch (error) {
      assertInvalidOpcode(error);
    }

    await postLicense.buyLicenseForERC20(token.address, {from: accounts[2]});

    let msg = "Check out my blog @ www.medium.com";
    const {logs} = await board.post(msg, {from: accounts[2]});

    const event = logs.find(e => e.event === 'Post')

    should.exist(event)
    event.args.sender.should.equal(accounts[2])
    event.args.text.should.equal(msg)
  })

  it("refunds a license for ETH", async function() {
    const balanceBefore = await web3.eth.getBalance(accounts[1])
    await postLicense.sellLicense({from: accounts[1]})
    await postLicense.withdrawPayments({from: accounts[1]})
    const balanceAfter = await web3.eth.getBalance(accounts[1])
    balanceAfter.should.be.bignumber.gt(balanceBefore)
  })

  it("refunds a license for ERC20", async function() {
    const balanceBefore = await token.balanceOf(accounts[2])
    await postLicense.sellLicense({from: accounts[2]})
    const balanceAfter = await token.balanceOf(accounts[2])
    balanceAfter.should.be.bignumber.gt(balanceBefore)
  })

});
