# X Protocol

USDX is a stablecoin designed to maintain a 1 USD valuation backed by short-term US Treasury bills. The yield generated by these T-bills is automatically distributed to USDX token holders through rebasing. This feature keeps the price of USDX stable while steadily increasing the balance of USDX for token holders.

X Protocol hosts the primary market that establishes the price peg. KYC-verified users can deposit collateral, either USDC or fiat currency, on our platform. In exchange, they receive USDX and can choose to redeem USDX for collateral or withdraw USDX to any Ethereum address. Since X Protocol offers an exchange rate of one dollar per USDX in both directions, any price movement in the external (secondary) market can be traded in the primary market to re-establish the peg.

[USDX](https://github.com/Xprotocol/tokens#USDX) is a rebasing ERC-20 token with a set of additional features, including pausing, blocking/unblocking accounts, role-based access control, and upgradability. The contract’s primary objective is to reflect the T-bills’ annual percentage yield (APY) within the token’s value. It achieves this through a reward multiplier rebasing mechanism, where the addRewardMultiplier function is called daily to adjust the reward multiplier, guaranteeing an accurate representation of yield from the underlying assets.

Acknowledging the complexities of handling rebasing tokens in the DeFi ecosystem, the [wUSDX](https://github.com/Xprotocol/tokens#wUSDX) contract serves as a wrapped token, simplifying integration while preserving stability. The wUSDX contract is an ERC-462 token vault, enabling users to deposit USDX in exchange for wUSDX tokens. The USDX tokens are rebasing, whereas the wUSDX tokens are non-rebasing, making wUSDX ideal for seamless integration with protocols in the DeFi ecosystem.

The wUSDX contract incorporates the ERC-2612 permit functionality, allowing the use of signatures to grant token allowances. Additionally, the close relationship between the wUSDX and USDX contracts is also worth noting; the wUSDX contract leverages the account block list from the USDX contract to govern transfers and, specifically, prevent transfers from accounts included in the block list.

Finally, the wUSDX token transfers can be paused in two ways: either by being paused directly from within the wUSDX contract or in the event the USDX contract is paused.

## Security

The [X Protocol Security Center](https://security.Xprotocol.com) contains more details about the secure development process.

The security policy is detailed in [SECURITY.md](https://github.com/Xprotocol/tokens/blob/main/SECURITY.md), and specifies how you can report security vulnerabilities and which versions will receive security updates. We run a [bug bounty program on Immunefi](https://immunefi.com/bounty/Xprotocol/) to reward the responsible disclosure of vulnerabilities.

## Audits

Audits can be found at https://github.com/Xprotocol/audits.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to run the linter and update tests as appropriate.

## Dev

This Project uses Hardhat. It includes a contract, its tests, and a script that deploys the contract.

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
npx hardhat run scripts/deploy.ts --network goerli
npx hardhat verify --network goerli <contract-address>
```

Help

```shell
npx hardhat help
```

### Features

- Access Control
- Rebasing token mechanism
- Minting and burning functionality
- Block/Unblock accounts
- Pausing emergency stop mechanism
- Reward multiplier system
- EIP-2612 permit support
- OpenZeppelin UUPS upgrade pattern

### USDX

#### Public and External Functions

- `initialize(string memory name_, string memory symbol_, address owner)`: Initializes the contract.
- `name()`: Returns the name of the token.
- `symbol()`: Returns the symbol of the token.
- `decimals()`: Returns the number of decimals the token uses.
- `convertToShares(uint256 amount)`: Converts an amount of tokens to shares.
- `convertToTokens(uint256 shares)`: Converts an amount of shares to tokens.
- `totalShares()`: Returns the total amount of shares.
- `totalSupply()`: Returns the total supply.
- `balanceOf(address account)`: Returns the account blanace.
- `sharesOf(address account)`: Returns the account shares.
- `mint(address to, uint256 amount)`: Creates new tokens to the specified address.
- `burn(address from, uint256 amount)`: Destroys tokens from the specified address.
- `transfer(address to, uint256 amount)`: Transfers tokens between addresses.
- `blockAccounts(address[] addresses)`: Blocks multiple accounts at once.
- `unblockAccounts(address[] addresses)`: Unblocks multiple accounts at once.
- `isBlocked(address account)`: Checks if an account is blocked.
- `pause()`: Pauses the contract, halting token transfers.
- `unpause()`: Unpauses the contract, allowing token transfers.
- `setRewardMultiplier(uint256 _rewardMultiplier)`: Sets the reward multiplier.
- `addRewardMultiplier(uint256 _rewardMultiplierIncrement)`: Adds the given amount to the current reward multiplier.
- `approve(address spender, uint256 amount)`: Approves an allowance for a spender.
- `allowance(address owner, address spender)`: Returns the allowance for a spender.
- `transferFrom(address from, address to, uint256 amount)`: Moves tokens from an address to another one using the allowance mechanism.
- `increaseAllowance(address spender, uint256 addedValue)`: Increases the allowance granted to spender by the caller.
- `decreaseAllowance(address spender, uint256 subtractedValue)`: Decreases the allowance granted to spender by the caller.
- `DOMAIN_SEPARATOR()`: Returns the EIP-712 domain separator.
- `nonces(address owner)`: Returns the nonce for the specified address.
- `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`: Implements EIP-2612 permit functionality.

#### Private and Internal Functions

- `_authorizeUpgrade(address newImplementation)`: Internal function to authorize an upgrade.
- `_mint(address to, uint256 amount)`: Internal function to mint tokens to the specified address.
- `_burn(address account, uint256 amount)`: Internal function to burn tokens from the specified address.
- `_beforeTokenTransfer(address from, address to, uint256 amount)`: Hook that is called before any transfer of tokens.
- `_afterTokenTransfer(address from, address to, uint256 amount)`: Hook that is called after any transfer of tokens.
- `_transfer(address from, address to, uint256 amount)`: Internal function to transfer tokens between addresses.
- `_blockAccount(address account)`: Internal function to block account.
- `_unblockAccount(address account)`: Internal function to unblock an account.
- `_setRewardMultiplier(uint256 _rewardMultiplier)`: Internal function to set the reward multiplier.
- `_spendAllowance(address owner, address spender, uint256 amount)`: Internal function to spend an allowance.
- `_useNonce(address owner)`: Increments and returns the current nonce for a given address.
- `_approve(address owner, address spender, uint256 amount)`: Internal function to approve an allowance for a spender.

#### Events

- `Transfer(from indexed addr, to uint256, amount uint256)`: Emitted when transferring tokens.
- `RewardMultiplier(uint256 indexed value)`: Emitted when the reward multiplier has changed.
- `Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when the allowance of a spender for an owner is set.
- `AccountBlocked(address indexed addr)`: Emitted when an address is blocked.
- `AccountUnblocked(address indexed addr)`: Emitted when an address is removed from the blocklist.
- `Paused(address account)`: Emitted when the pause is triggered by account.
- `Unpaused(address account)`: Emitted when the unpause is triggered by account.
- `Upgraded(address indexed implementation)`: Emitted when the implementation is upgraded.

#### Roles

- `DEFAULT_ADMIN_ROLE`: Grants the ability to grant roles.
- `MINTER_ROLE`: Grants the ability to mint tokens.
- `BURNER_ROLE`: Grants the ability to burn tokens.
- `BLOCKLIST_ROLE`: Grants the ability to manage the blocklist.
- `ORACLE_ROLE`: Grants the ability to update the reward multiplier.
- `UPGRADE_ROLE`: Grants the ability to upgrade the contract.
- `PAUSE_ROLE`: Grants the ability to pause/unpause the contract.

### wUSDX

#### Public and External Functions

- `initialize(IUSDX _USDX, address owner)`: Initializes the contract.
- `pause()`: Pauses the contract, halting token transfers.
- `unpause()`: Unpauses the contract, allowing token transfers.
- `paused()`: Returns true if USDX or wUSDX is paused, and false otherwise.
- `DOMAIN_SEPARATOR()`: Returns the EIP-712 domain separator.
- `nonces(address owner)`: Returns the nonce for the specified address.
- `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`: Implements EIP-2612 permit functionality.

#### Private and Internal Functions

- `_beforeTokenTransfer(address from, address to, uint256 amount)`: Hook that is called before any transfer of tokens.
- `_authorizeUpgrade(address newImplementation)`: Internal function to authorize an upgrade.
- `_useNonce(address owner)`: Increments and returns the current nonce for a given address.

#### Events

- `Transfer(from indexed addr, to uint256, amount uint256)`: Emitted when transferring tokens.
- `Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when the allowance of a spender for an owner is set.
- `Paused(address account)`: Emitted when the pause is triggered by account.
- `Unpaused(address account)`: Emitted when the unpause is triggered by account.
- `Upgraded(address indexed implementation)`: Emitted when the implementation is upgraded.

#### Roles

- `DEFAULT_ADMIN_ROLE`: Grants the ability to grant roles.
- `UPGRADE_ROLE`: Grants the ability to upgrade the contract.
- `PAUSE_ROLE`: Grants the ability to pause/unpause the contract.

## Deployments

USDX
wUSDX



Alexander Reed
