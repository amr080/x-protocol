# Mountain Protocol USD

This smart contract implements a custom rebasing ERC-20 token with additional features like pausing, blocklisting, access control, and upgradability. The contract aims to reflect the T-Bills APY into the token value through a reward multiplier mechanism. Users receive a proportional number of shares when they deposit tokens, and the number of tokens they can withdraw is calculated based on the current reward multiplier. The addRewardMultiplier function is called once a day to adjust the reward multiplier, ensuring accurate reflection of the yield from 3 months maturity T-Bills.

## Features

- OpenZeppelin Access Control
- Rebasing token mechanism
- Minting and burning functionality
- Blocklisting accounts
- Pausing emergency stop mechanism
- Reward multiplier system
- EIP-2612 permit support
- OpenZeppelin UUPS upgrade pattern

## Dev

### Contributing

This project uses Hardhat. It includes a contract, its tests, and a script that deploys the contract.

> Prerequisites: Node v18 LTS

### Installation

1. Install dependencies

    ```shell
    npm i
    ```

2. Copy ENV file

    ```shell
    cp .env.example .env
    ```

3. Replace ENV variables with the values as needed

### Usage

Try running some of the following tasks:

Testing

```shell
npm run test
```

Coverage

```shell
npm run coverage
```

Linter

```shell
npm run lint
```

Running local node

```shell
npx hardhat node
```

Compile

```shell
npx hardhat compile
```

Deploying and contract verification

```shell
npx hardhat run scripts/deploy.ts--network goerli
npx hardhat verify --network goerli <contact-address>
```

Help

```shell
npx hardhat help
```

### Functions

#### Public and External Functions

- `initialize(string memory name_, string memory symbol_, uint256 initialSupply)`: Initializes the contract.
- `name()`: Returns the name of the token.
- `symbol()`: Returns the symbol of the token.
- `decimals()`: Returns the number of decimals the token uses.
- `convertToShares(uint256 amount)`: Converts an amount of tokens to shares.
- `convertToToken(uint256 shares)`: Converts an amount of shares to tokens.
- `totalShares()`: Returns the total amount of shares.
- `totalSupply()`: Returns the total supply.
- `balanceOf(address account)`: Returns the balance of account.
- `sharesOf(address account)`: Returns the shares of account.
- `mint(address to, uint256 amount)`: Creates new tokens to the specified address.
- `burn(address from, uint256 amount)`: Destroys tokens from the specified address.
- `transfer(address to, uint256 amount)`: Transfers tokens between addresses.
- `blocklistAccounts(address[] addresses)`: Blocklists multiple accounts at once.
- `unblocklistAccounts(address[] addresses)`: Unblocklists multiple accounts at once.
- `isBlocklisted(address account)`: Checks if account is blocklisted.
- `pause()`: Pauses the contract, halting token transfers.
- `unpause()`: Unpauses the contract, allowing token transfers.
- `setRewardMultiplier(uint256 rewardMultiplier_)`: Sets the reward multiplier.
- `addRewardMultiplier(uint256 rewardMultiplier_)`: Adds the provided interest rate to the current reward multiplier.
- `approve(address spender, uint256 amount)`: Approves an allowance for a spender.
- `allowance(address owner, address spender)`: Returns the allowance for a spender.
- `transferFrom(address from, address to, uint256 amount)`: Moves tokens from an address to another one using the allowance mechanism.
- `increaseAllowance(address spender, uint256 addedValue)`: Increases the allowance granted to spender by the caller.
- `decreaseAllowance(address spender, uint256 subtractedValue)`: Decreases the allowance granted to spender by the caller.
- `DOMAIN_SEPARATOR()`: Returns the EIP-712 domain separator.
- `nonces(address owner)`: Returns the nonce for the specified address.
- `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`: Implements EIP-2612 permit functionality.

#### Private and internal Functions

- `_authorizeUpgrade(address newImplementation)`: Internal function to authorize an upgrade.
- `_mint(address to, uint256 amount)`: Internal function to mint tokens to the specified address.
- `_burn(address account, uint256 amount)`: Internal function to burn tokens from the specified address.
- `_beforeTokenTransfer(address from, address to, uint256 amount)`: Hook that is called before any transfer of tokens.
- `_afterTokenTransfer(address from, address to, uint256 amount)`: Hook that is called after any transfer of tokens.
- `_transfer(address from, address to, uint256 amount)`: Internal function to transfer tokens between addresses.
- `_blocklistAccount(address account)`: Internal function to blocklists account.
- `_unblocklistAccount(address account)`: Internal function to unblocklists account.
- `_setRewardMultiplier(uint256 _rewardMultiplier)`: Internal function to sets the reward multiplier.
- `_spendAllowance(address owner, address spender, uint256 amount)`: Internal function to spend an allowance.
- `_useNonce(address owner)`: Increments and returns the current nonce for a given address.
- `_approve(address owner, address spender, uint256 amount)`: Internal function to approve an allowance for a spender.

#### Events

- `Transfer(from indexed addr, to uint256, amount uint256)`: Emitted when transferring tokens.
- `RewardMultiplier(uint256 indexed value)`: Emitted when the reward multiplier has changed.
- `Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when the allowance of a spender for an owner is set.
- `AddressBlocklisted(address indexed addr)`: Emitted when an address is blocklisted.
- `AddressUnBlocklisted(address indexed addr)`: Emitted when an address is removed from the blocklist.
- `Paused(address account)`: Emitted when the pause is triggered by account.
- `Unpaused(address account)`: Emitted when the unpause is triggered by account.

#### Roles

- `MINTER_ROLE`: Grants the ability to mint tokens.
- `BURNER_ROLE`: Grants the ability to burn tokens.
- `BLOCKLIST_ROLE`: Grants the ability to manage the blocklist.
- `ORACLE_ROLE`: Grants the ability to update the reward multiplier.
- `UPGRADE_ROLE`: Grants the ability to upgrade the contract.
- `PAUSE_ROLE`: Grants the ability to pause/unpause the contract.
