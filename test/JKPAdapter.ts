import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

enum GameOptions {
  NONE,
  ROCK,
  PAPER,
  SCISSORS,
}

const DEFAULT_BID = ethers.parseEther("0.001");

describe("JKPAdapter", function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, player1, player2] = await ethers.getSigners();

    const JoKenPoContract = await ethers.getContractFactory("JoKenPo");
    const joKenPo = await JoKenPoContract.deploy();

    const JKPAdapterContract = await ethers.getContractFactory("JKPAdapter");
    const jkpAdapter = await JKPAdapterContract.deploy();

    return { joKenPo, owner, player1, player2, jkpAdapter };
  }

  it("Should updgrade implementation of JoKenPo", async function () {
    const { jkpAdapter, joKenPo } = await loadFixture(deployFixture);
    await jkpAdapter.upgradeImplementation(joKenPo);
    const jkpAdapterImplementationAddress =
      await jkpAdapter.getImplementationAddress();

    expect(jkpAdapterImplementationAddress).to.equal(joKenPo);
  });
  it("Should NOT updgrade implementation of JoKenPo (NOT THE OWNER)", async function () {
    const { jkpAdapter, joKenPo, player1 } = await loadFixture(deployFixture);
    await expect(
      jkpAdapter.connect(player1).upgradeImplementation(joKenPo)
    ).to.be.revertedWith("You do not have permission");
  });
  it("Should NOT updgrade implementation of JoKenPo (NO CONTRACT)", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(
      jkpAdapter.upgradeImplementation(ethers.ZeroAddress)
    ).to.be.revertedWith("address should not be empty");
  });
  it("Should NOT get address of JoKenPo (NO CONTRACT)", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(jkpAdapter.getImplementationAddress()).to.be.revertedWith(
      "Contract is upgrading"
    );
  });
  it("Should get bid", async function () {
    const { jkpAdapter, joKenPo } = await loadFixture(deployFixture);
    await jkpAdapter.upgradeImplementation(joKenPo);
    const bid = await jkpAdapter.getBid();
    expect(bid).to.equal(DEFAULT_BID);
  });
  it("Should NOT get bid (NO CONTRACT)", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(jkpAdapter.getBid()).to.be.revertedWith(
      "Contract is upgrading"
    );
  });
  it("Should set bid", async function () {
    const { jkpAdapter, joKenPo } = await loadFixture(deployFixture);
    await jkpAdapter.upgradeImplementation(joKenPo);
    await jkpAdapter.setBid(ethers.parseEther("0.002"));
    const bid = await jkpAdapter.getBid();
    expect(bid).to.equal(ethers.parseEther("0.002"));
  });
  it("Should NOT set bid (NO CONTRACT)", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(
      jkpAdapter.setBid(ethers.parseEther("0.002"))
    ).to.be.revertedWith("Contract is upgrading");
  });
  it("Should NOT set bid (NOT THE OWNER)", async function () {
    const { jkpAdapter, player1 } = await loadFixture(deployFixture);
    await expect(
      jkpAdapter.connect(player1).setBid(ethers.parseEther("0.002"))
    ).to.be.revertedWith("You do not have permission");
  });
  it("Should get commission", async function () {
    const { jkpAdapter, joKenPo } = await loadFixture(deployFixture);
    await jkpAdapter.upgradeImplementation(joKenPo);
    const commission = await jkpAdapter.getCommission();
    expect(commission).to.equal(10);
  });
  it("Should NOT get commission (NO CONTRACT)", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(jkpAdapter.getCommission()).to.be.revertedWith(
      "Contract is upgrading"
    );
  });
  it("Should set commission", async function () {
    const { jkpAdapter, joKenPo } = await loadFixture(deployFixture);
    await jkpAdapter.upgradeImplementation(joKenPo);
    await jkpAdapter.setCommission(20);
    const commission = await jkpAdapter.getCommission();
    expect(commission).to.equal(20);
  });
  it("Should NOT set commission (NO CONTRACT)", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(jkpAdapter.setCommission(20)).to.be.revertedWith(
      "Contract is upgrading"
    );
  });
  it("Should NOT set commission (NOT THE OWNER)", async function () {
    const { jkpAdapter, player1 } = await loadFixture(deployFixture);
    await expect(
      jkpAdapter.connect(player1).setCommission(20)
    ).to.be.revertedWith("You do not have permission");
  });
  it("Shoul Play", async function () {
    const { jkpAdapter, joKenPo, player1, player2 } = await loadFixture(
      deployFixture
    );
    await jkpAdapter.upgradeImplementation(joKenPo);
    await jkpAdapter.connect(player1).play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });
    const result = await jkpAdapter.getResult();
    expect(result).to.equal("Player 1 plays waiting player 2");
  });
  it("Should NOT play (NO CONTRACT)", async function () {
    const { jkpAdapter, player1 } = await loadFixture(deployFixture);
    await expect(
      jkpAdapter.connect(player1).play(GameOptions.ROCK, {
        value: DEFAULT_BID,
      })
    ).to.be.revertedWith("Contract is upgrading");
  });

  it("Should NOT get result", async function () {
    const { jkpAdapter } = await loadFixture(deployFixture);
    await expect(jkpAdapter.getResult()).to.be.revertedWith(
      "Contract is upgrading"
    );
  });
});
