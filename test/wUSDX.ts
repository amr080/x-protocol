import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { Contract, BigNumber, constants } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { parseUnits, keccak256, toUtf8Bytes, defaultAbiCoder, id, splitSignature } from 'ethers/lib/utils';

const { AddressZero, MaxUint256 } = constants;

const roles = {
  MINTER: keccak256(toUtf8Bytes('MINTER_ROLE')),
  BURNER: keccak256(toUtf8Bytes('BURNER_ROLE')),
  BLOCKLIST: keccak256(toUtf8Bytes('BLOCKLIST_ROLE')),
  ORACLE: keccak256(toUtf8Bytes('ORACLE_ROLE')),
  UPGRADE: keccak256(toUtf8Bytes('UPGRADE_ROLE')),
  PAUSE: keccak256(toUtf8Bytes('PAUSE_ROLE')),
  DEFAULT_ADMIN_ROLE: ethers.constants.HashZero,
};

describe('wUSDX', () => {
  const name = 'Wrapped X Protocol USD';
  const symbol = 'wUSDX';
  const totalUSDXShares = parseUnits('1337');

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  const deployFixture = async () => {
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2] = await ethers.getSigners();

    const USDX = await ethers.getContractFactory('USDX');
    const USDXContract = await upgrades.deployProxy(USDX, ['USDX-n', 'USDX-s', owner.address], {
      initializer: 'initialize',
    });

    await USDXContract.grantRole(roles.MINTER, owner.address);
    await USDXContract.grantRole(roles.ORACLE, owner.address);
    await USDXContract.grantRole(roles.PAUSE, owner.address);
    await USDXContract.grantRole(roles.BLOCKLIST, owner.address);
    await USDXContract.mint(owner.address, totalUSDXShares);

    const wUSDX = await ethers.getContractFactory('wUSDX');
    const wUSDXContract = await upgrades.deployProxy(wUSDX, [USDXContract.address, owner.address], {
      initializer: 'initialize',
    });

    await wUSDXContract.grantRole(roles.PAUSE, owner.address);
    await wUSDXContract.grantRole(roles.UPGRADE, owner.address);

    return { wUSDXContract, USDXContract, owner, acc1, acc2 };
  };

  describe('Deployment', () => {
    it('has a name', async () => {
      const { wUSDXContract } = await loadFixture(deployFixture);

      expect(await wUSDXContract.name()).to.equal(name);
    });

    it('has a symbol', async () => {
      const { wUSDXContract } = await loadFixture(deployFixture);

      expect(await wUSDXContract.symbol()).to.equal(symbol);
    });

    it('has an asset', async () => {
      const { wUSDXContract, USDXContract } = await loadFixture(deployFixture);

      expect(await wUSDXContract.asset()).to.equal(USDXContract.address);
    });

    it('has a totalAssets', async () => {
      const { wUSDXContract } = await loadFixture(deployFixture);

      expect(await wUSDXContract.totalAssets()).to.equal(0);
    });

    it('has a maxDeposit', async () => {
      const { wUSDXContract, acc1 } = await loadFixture(deployFixture);

      expect(await wUSDXContract.maxDeposit(acc1.address)).to.equal(MaxUint256);
    });

    it('has a maxMint', async () => {
      const { wUSDXContract, acc1 } = await loadFixture(deployFixture);

      expect(await wUSDXContract.maxMint(acc1.address)).to.equal(MaxUint256);
    });

    it('has 18 decimals', async () => {
      const { wUSDXContract } = await loadFixture(deployFixture);

      expect(await wUSDXContract.decimals()).to.be.equal(18);
    });

    it('grants admin role to the address passed to the initializer', async () => {
      const { wUSDXContract, owner } = await loadFixture(deployFixture);

      expect(await wUSDXContract.hasRole(await wUSDXContract.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it('fails if initialize is called again after initialization', async () => {
      const { wUSDXContract, USDXContract, owner } = await loadFixture(deployFixture);

      await expect(wUSDXContract.initialize(USDXContract.address, owner.address)).to.be.revertedWith(
        'Initializable: contract is already initialized',
      );
    });
  });

  describe('Access control', () => {
    it('pauses when pause role', async () => {
      const { wUSDXContract, owner } = await loadFixture(deployFixture);

      await expect(await wUSDXContract.pause()).to.not.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${roles.PAUSE}`,
      );
    });

    it('does not pause without pause role', async () => {
      const { wUSDXContract, acc1 } = await loadFixture(deployFixture);

      await expect(wUSDXContract.connect(acc1).pause()).to.be.revertedWith(
        `AccessControl: account ${acc1.address.toLowerCase()} is missing role ${roles.PAUSE}`,
      );
    });

    it('unpauses when pause role', async () => {
      const { wUSDXContract, owner } = await loadFixture(deployFixture);

      await wUSDXContract.connect(owner).pause();

      await expect(await wUSDXContract.unpause()).to.not.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${roles.PAUSE}`,
      );
    });

    it('does not unpause without pause role', async () => {
      const { wUSDXContract, owner, acc1 } = await loadFixture(deployFixture);

      await wUSDXContract.connect(owner).pause();

      await expect(wUSDXContract.connect(acc1).unpause()).to.be.revertedWith(
        `AccessControl: account ${acc1.address.toLowerCase()} is missing role ${roles.PAUSE}`,
      );
    });

    it('does not upgrade without upgrade role', async () => {
      const { wUSDXContract, acc1 } = await loadFixture(deployFixture);

      await expect(wUSDXContract.connect(acc1).upgradeTo(AddressZero)).to.be.revertedWith(
        `AccessControl: account ${acc1.address.toLowerCase()} is missing role ${roles.UPGRADE}`,
      );
    });

    it('upgrades with upgrade role', async () => {
      const { wUSDXContract, acc1 } = await loadFixture(deployFixture);

      await wUSDXContract.grantRole(roles.UPGRADE, acc1.address);

      await expect(wUSDXContract.connect(acc1).upgradeTo(AddressZero)).to.not.be.revertedWith(
        `AccessControl: account ${acc1.address.toLowerCase()} is missing role ${roles.UPGRADE}`,
      );
    });
  });

  describe('Pause status should follow USDX pause status', () => {
    it('should be paused when USDX is paused', async () => {
      const { wUSDXContract, USDXContract, owner } = await loadFixture(deployFixture);

      expect(await wUSDXContract.paused()).to.equal(false);
      await USDXContract.connect(owner).pause();
      expect(await wUSDXContract.paused()).to.equal(true);
    });
  });

  describe('Accrue value', () => {
    // Error should always fall 7 orders of magnitud below than one cent of a dollar (1 GWEI)
    // Inaccuracy stems from using fixed-point arithmetic and Solidity's 18-decimal support
    // resulting in periodic number approximations during divisions
    const expectEqualWithError = (actual: BigNumber, expected: BigNumber, error = '0.000000001') => {
      expect(actual).to.be.closeTo(expected, parseUnits(error));
    };

    it('can accrue value without rebasing', async () => {
      const { wUSDXContract, USDXContract, owner } = await loadFixture(deployFixture);
      const initialBalance = await USDXContract.balanceOf(owner.address);

      await USDXContract.connect(owner).approve(wUSDXContract.address, MaxUint256);
      await wUSDXContract.connect(owner).deposit(initialBalance, owner.address);

      expect(await USDXContract.balanceOf(owner.address)).to.be.equal(0);
      expect(await wUSDXContract.balanceOf(owner.address)).to.be.equal(initialBalance);

      const rewardMultiplier = parseUnits('1.0001');
      const expectedIncrement = initialBalance.mul(rewardMultiplier).div(parseUnits('1'));

      await USDXContract.connect(owner).setRewardMultiplier(rewardMultiplier);

      expect(await wUSDXContract.balanceOf(owner.address)).to.be.equal(initialBalance);
      expect(await wUSDXContract.totalAssets()).to.be.equal(expectedIncrement);
      expect(await USDXContract.balanceOf(wUSDXContract.address)).to.be.equal(expectedIncrement);

      await wUSDXContract
        .connect(owner)
        .redeem(await wUSDXContract.balanceOf(owner.address), owner.address, owner.address);

      expectEqualWithError(await USDXContract.balanceOf(owner.address), expectedIncrement);
    });
  });

  describe('Transfer between users', () => {
    it('can transfer wUSDX and someone else redeem', async () => {
      const { wUSDXContract, USDXContract, owner, acc1 } = await loadFixture(deployFixture);

      await USDXContract.connect(owner).approve(wUSDXContract.address, MaxUint256);
      await wUSDXContract.connect(owner).deposit(parseUnits('2'), owner.address);
      await wUSDXContract.connect(owner).transfer(acc1.address, parseUnits('1'));

      expect(await wUSDXContract.totalAssets()).to.be.equal(parseUnits('2'));
      expect(await wUSDXContract.balanceOf(acc1.address)).to.be.equal(parseUnits('1'));
      expect(await wUSDXContract.maxWithdraw(acc1.address)).to.be.equal(parseUnits('1'));

      await wUSDXContract.connect(acc1).withdraw(parseUnits('1'), acc1.address, acc1.address);

      expect(await USDXContract.balanceOf(acc1.address)).to.be.equal(parseUnits('1'));
    });

    it('should not transfer on a USDX pause', async () => {
      const { wUSDXContract, USDXContract, owner, acc1 } = await loadFixture(deployFixture);

      await USDXContract.connect(owner).approve(wUSDXContract.address, MaxUint256);
      await wUSDXContract.connect(owner).deposit(parseUnits('2'), owner.address);
      await USDXContract.connect(owner).pause();

      await expect(wUSDXContract.connect(owner).transfer(acc1.address, parseUnits('2'))).to.be.revertedWithCustomError(
        wUSDXContract,
        'wUSDXPausedTransfers',
      );

      await USDXContract.connect(owner).unpause();

      await expect(wUSDXContract.connect(owner).transfer(acc1.address, parseUnits('2'))).not.to.be.reverted;
    });

    it('should not transfer if blocked', async () => {
      const { wUSDXContract, USDXContract, owner, acc1, acc2 } = await loadFixture(deployFixture);

      await USDXContract.connect(owner).approve(wUSDXContract.address, MaxUint256);
      await wUSDXContract.connect(owner).deposit(parseUnits('2'), owner.address);
      await wUSDXContract.connect(owner).transfer(acc1.address, parseUnits('2'));
      await USDXContract.connect(owner).blockAccounts([acc1.address]);

      await expect(wUSDXContract.connect(acc1).transfer(acc2.address, parseUnits('2'))).to.be.revertedWithCustomError(
        wUSDXContract,
        'wUSDXBlockedSender',
      );

      await USDXContract.connect(owner).unblockAccounts([acc1.address]);

      await expect(wUSDXContract.connect(acc1).transfer(acc1.address, parseUnits('2'))).not.to.be.reverted;
    });

    it('transfers the proper amount with a non default multiplier', async () => {
      const { wUSDXContract, USDXContract, owner, acc1 } = await loadFixture(deployFixture);
      const amount = '1999999692838904485'; // 1.999999692838904485

      await USDXContract.connect(owner).setRewardMultiplier('1002948000000000000'); // 1.002948
      expect(await wUSDXContract.balanceOf(acc1.address)).to.equal(0);

      await USDXContract.connect(owner).approve(wUSDXContract.address, MaxUint256);
      await wUSDXContract.connect(owner).deposit(parseUnits('100'), owner.address);

      await wUSDXContract.connect(owner).transfer(acc1.address, amount);

      expect(await wUSDXContract.balanceOf(acc1.address)).to.equal('1999999692838904485');
    });
  });

  describe('Permit', () => {
    const buildData = async (
      contract: Contract,
      owner: SignerWithAddress,
      spender: SignerWithAddress,
      value: number,
      nonce: number,
      deadline: number | BigNumber,
    ) => {
      const domain = {
        name: await contract.name(),
        version: '1',
        chainId: (await contract.provider.getNetwork()).chainId,
        verifyingContract: contract.address,
      };

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const message: Message = {
        owner: owner.address,
        spender: spender.address,
        value,
        nonce,
        deadline,
      };

      return { domain, types, message };
    };

    interface Message {
      owner: string;
      spender: string;
      value: number;
      nonce: number;
      deadline: number | BigNumber;
    }

    const signTypedData = async (
      signer: SignerWithAddress,
      domain: TypedDataDomain,
      types: Record<string, Array<TypedDataField>>,
      message: Message,
    ) => {
      const signature = await signer._signTypedData(domain, types, message);

      return splitSignature(signature);
    };

    it('initializes nonce at 0', async () => {
      const { wUSDXContract, acc1 } = await loadFixture(deployFixture);

      expect(await wUSDXContract.nonces(acc1.address)).to.equal(0);
    });

    it('returns the correct domain separator', async () => {
      const { wUSDXContract } = await loadFixture(deployFixture);
      const chainId = (await wUSDXContract.provider.getNetwork()).chainId;

      const expected = keccak256(
        defaultAbiCoder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
          [
            id('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
            id(await wUSDXContract.name()),
            id('1'),
            chainId,
            wUSDXContract.address,
          ],
        ),
      );

      expect(await wUSDXContract.DOMAIN_SEPARATOR()).to.equal(expected);
    });

    it('accepts owner signature', async () => {
      const { wUSDXContract, owner, acc1: spender } = await loadFixture(deployFixture);
      const value = 100;
      const nonce = await wUSDXContract.nonces(owner.address);
      const deadline = MaxUint256;

      const { domain, types, message } = await buildData(wUSDXContract, owner, spender, value, nonce, deadline);
      const { v, r, s } = await signTypedData(owner, domain, types, message);

      await expect(wUSDXContract.permit(owner.address, spender.address, value, deadline, v, r, s))
        .to.emit(wUSDXContract, 'Approval')
        .withArgs(owner.address, spender.address, value);
      expect(await wUSDXContract.nonces(owner.address)).to.equal(1);
      expect(await wUSDXContract.allowance(owner.address, spender.address)).to.equal(value);
    });

    it('reverts reused signature', async () => {
      const { wUSDXContract, owner, acc1: spender } = await loadFixture(deployFixture);
      const value = 100;
      const nonce = await wUSDXContract.nonces(owner.address);
      const deadline = MaxUint256;

      const { domain, types, message } = await buildData(wUSDXContract, owner, spender, value, nonce, deadline);
      const { v, r, s } = await signTypedData(owner, domain, types, message);

      await wUSDXContract.permit(owner.address, spender.address, value, deadline, v, r, s);

      await expect(wUSDXContract.permit(owner.address, spender.address, value, deadline, v, r, s))
        .to.be.revertedWithCustomError(wUSDXContract, 'ERC2612InvalidSignature')
        .withArgs(owner.address, spender.address);
    });

    it('reverts other signature', async () => {
      const { wUSDXContract, owner, acc1: spender, acc2: otherAcc } = await loadFixture(deployFixture);
      const value = 100;
      const nonce = await wUSDXContract.nonces(owner.address);
      const deadline = MaxUint256;

      const { domain, types, message } = await buildData(wUSDXContract, owner, spender, value, nonce, deadline);
      const { v, r, s } = await signTypedData(otherAcc, domain, types, message);

      await expect(wUSDXContract.permit(owner.address, spender.address, value, deadline, v, r, s))
        .to.be.revertedWithCustomError(wUSDXContract, 'ERC2612InvalidSignature')
        .withArgs(owner.address, spender.address);
    });

    it('reverts expired permit', async () => {
      const { wUSDXContract, owner, acc1: spender } = await loadFixture(deployFixture);
      const value = 100;
      const nonce = await wUSDXContract.nonces(owner.address);
      const deadline = await time.latest();

      // Advance time by one hour and mine a new block
      await time.increase(3600);

      // Set the timestamp of the next block but don't mine a new block
      // New block timestamp needs larger than current, so we need to add 1
      const blockTimestamp = (await time.latest()) + 1;
      await time.setNextBlockTimestamp(blockTimestamp);

      const { domain, types, message } = await buildData(wUSDXContract, owner, spender, value, nonce, deadline);
      const { v, r, s } = await signTypedData(owner, domain, types, message);

      await expect(wUSDXContract.permit(owner.address, spender.address, value, deadline, v, r, s))
        .to.be.revertedWithCustomError(wUSDXContract, 'ERC2612ExpiredDeadline')
        .withArgs(deadline, blockTimestamp);
    });
  });
});
