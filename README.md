# Licensing Demo
Example of how licensing could work via smart contracts.


# Contracts
## Licensed.sol
Abstract class

### holdsValidLicense(address holder) constant returns (bool)
A license contract should validate whether or not an address is associated with a license holder.

## PostLicense.sol

### buyLicenseForERC20(address token)
Transfers tokens from sender to this contract and whitelists the sender.

### buyLicenseForETH() payable
Accepts the license price in ETH from the sender and whitelists the sender.

### sellLicense()
Refunds the whitelisted sender, either by transfering tokens or ETH via PullPayment, and unlists the sender

### addAcceptedToken(address token, uint256 price, uint256 reimbursement) onlyOwner
### removeAcceptedToken(address token) onlyOwner 
Used to specify which ERC20 tokens are acceptible for payment and at what rates.


## Board.sol

### post(string text)
If the sender holds a valid license with the associated Licensed contract, they post a message (event) to the board
