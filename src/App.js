import React, { Component } from 'react'
import PostLicenseContract from '../build/contracts/PostLicense.json'
import LicensingTokenContract from '../build/contracts/LicensingToken.json'
import BoardContract from '../build/contracts/Board.json'
import getWeb3 from './utils/getWeb3'

import PostList from './PostList'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      board: null,
      licensingToken: null,
      postLicense: null,
      tokenBalance: 0,
      ethBalance: 0,
      licensed: false,
      ethPrice: 1,
      litPrice: 100,
      posts: [],
      message: '',
      account: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')

    const board = contract(BoardContract)
    const licensingToken = contract(LicensingTokenContract)
    const postLicense = contract(PostLicenseContract)
    board.setProvider(this.state.web3.currentProvider)
    postLicense.setProvider(this.state.web3.currentProvider)
    licensingToken.setProvider(this.state.web3.currentProvider)

    board.at('0x510b04a8f5089e76f86e1bd318e002325309871a')
    .then(instance => {
      return this.setState({
        board: instance
      })
    })
    .then(() => {
      var postEvent = this.state.board.Post({},{fromBlock: 1576849, toBlock: 'latest'});
      console.log(postEvent);
      postEvent.watch((error, result) => {
        if(error) {
          console.log(error);
        }
        console.log(result);
        this.setState({
          posts: this.state.posts.concat([{sender: result.args.sender, text: result.args.text, blockHeight: result.blockNumber}])
        })
      })
    })

    postLicense.at('0x4761008f4cc6d9b6c514debed7c1fecc55087256')
    .then(instance => {
      this.setState({
        postLicense: instance
      })
      this.checkLicense()
      this.checkETHBalance()
      this.getETHPrice()
      this.getLITPrice()
    })

    licensingToken.at('0xDaBD9e09A72D99e8188C3D8F8Db49F4827997958')
    .then(instance => {
      this.setState({
        licensingToken: instance
      })
      this.checkLITBalance()
    })
  }

  checkLicense() {
    this.state.postLicense.holdsValidLicense(this.state.web3.eth.coinbase)
    .then(result => {
      this.setState({
        licensed: result
      })
    })
  }

  getETHPrice() {
    this.state.postLicense.getLicensePrice()
    .then(ethPrice => {
      this.setState({
        ethPrice: Number(this.state.web3.fromWei(ethPrice, 'ether'))
      })
    })
  }

  //keeps returning the ethprice. returns correct value in Remix
  getLITPrice() {
    // this.state.postLicense.getLicensePrice("0xdabd9e09a72d99e8188c3d8f8db49f4827997958")
    // .then(litPrice => {
    //   this.setState({
    //     litPrice: Number(litPrice)
    //   })
    // })
  }

  checkLITBalance() {
    this.state.licensingToken.balanceOf(this.state.web3.eth.coinbase)
    .then(result => {
      this.setState({
        tokenBalance: Number(result)
      })
    })
  }

  checkETHBalance() {
    this.state.postLicense.payments(this.state.web3.eth.coinbase)
    .then(result => {
      this.setState({
        ethBalance: Number(this.state.web3.fromWei(result, 'ether'))
      })
    })
  }

  getTokens() {
    this.state.licensingToken.getTokens({from: this.state.web3.eth.coinbase})
    .then(tx => {
      this.checkLITBalance()
    })
  }

  messageChanged(event) {
    this.setState({ message: event.target.value })
  }

  postMessage(event) {
    event.preventDefault()
    this.state.board.post(this.state.message, {from: this.state.web3.eth.coinbase})
    .then(tx => {
      this.setState({message: ''})
    })
  }

  buyLicenseForETH() {
    this.state.postLicense.buyLicenseForETH({from: this.state.web3.eth.coinbase, value: this.state.web3.toWei(this.state.ethPrice, 'ether')})
    .then(tx => {
      this.checkLicense()
    })
  }

  buyLicenseForLIT() {
    this.state.postLicense.buyLicenseForERC20(this.state.licensingToken.address, {from: this.state.web3.eth.coinbase})
    .then(tx => {
      this.checkLicense()
    })
  }

  sellLicense() {
    this.state.postLicense.sellLicense({from: this.state.web3.eth.coinbase})
    .then(tx => {
      this.checkLicense()
      this.checkLITBalance()
      this.checkETHBalance()
    })
  }

  withdrawPayments() {
    this.state.postLicense.withdrawPayments({from: this.state.web3.eth.coinbase})
    .then(tx => {
      this.checkETHBalance()
    })
  }

  approveTokens() {
    this.state.licensingToken.approve(this.state.postLicense.address, 100, {from: this.state.web3.eth.coinbase})
  }

  render() {
    var boardList;
    if(this.state.posts.length > 0) {
      boardList = <PostList posts={this.state.posts} viewer={this.state.web3.eth.coinbase}/>;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Licensing Demo</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              {this.state.board &&
                <div>
                  <h1>Board</h1>
                  {boardList || <div>Loading Board...</div>}
                  {this.state.licensed &&
                    <form onSubmit={this.postMessage.bind(this)}>
                      <input
                      id="message"
                      name="message"
                      type="text"
                      value={this.state.message}
                      placeholder="Enter your message"
                      onChange={this.messageChanged.bind(this)}
                      required
                      />
                      <input
                        type="submit"
                        value="Post"
                        disabled={!this.state.licensed}
                      />
                    </form>}
                </div>
              }
              {this.state.postLicense &&
                <div>
                  <h1>PostLicense</h1>
                  {!this.state.licensed &&
                  <div>
                    <p>You are <span className="red">not licensed</span> to post on the board.</p>
                    <p>You can purchase a license using ETH or the ERC20 Licensing Token, LIT</p>
                    <p>To purchase via LIT: </p>
                    <ol>
                      <li>Make sure you have a balance of at least 100 LIT (if not get LIT below)</li>
                      <li>Approve 100 LIT: this allows the licensing contract to withdraw 100 tokens on your behalf</li>
                      <li>Buy License for 100 LIT</li>
                    </ol>
                    <button onClick={this.buyLicenseForETH.bind(this)}>Buy License for {this.state.ethPrice} ETH</button>
                    <button onClick={this.approveTokens.bind(this)}>Approve {this.state.litPrice} LIT</button>
                    <button onClick={this.buyLicenseForLIT.bind(this)}>Buy License for {this.state.litPrice} LIT</button>
                    {(this.state.ethBalance > 0) && <button onClick={this.withdrawPayments.bind(this)}>Withdraw {this.state.ethBalance} ETH</button>}
                  </div>}
                  {this.state.licensed &&
                  <div>
                    <p>You are <span className="green">licensed</span> to post on the board.</p>
                    <button onClick={this.sellLicense.bind(this)}>Sell License</button>
                  </div>}
                </div>
              }
              {this.state.licensingToken &&
                <div>
                  <h1>LicensingToken</h1>
                  <p>Your balance: {this.state.tokenBalance} LIT</p>
                  <button onClick={this.checkLITBalance.bind(this)}>Check Balance</button>
                  <button onClick={this.getTokens.bind(this)}>Get 100 LIT</button>
                </div>
              }
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
