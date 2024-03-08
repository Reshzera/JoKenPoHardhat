import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

enum GameOptions {
  NONE,
  ROCK,
  PAPER,
  SCISSORS,
}

const DEFAULT_BID = ethers.parseEther("0.001");

describe("JoKenPo", function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, player1, player2] = await ethers.getSigners();

    const JoKenPoContract = await ethers.getContractFactory("JoKenPo");
    const joKenPo = await JoKenPoContract.deploy();

    return { joKenPo, owner, player1, player2 };
  }

  it("Should get commission", async function () {
    const { joKenPo } = await loadFixture(deployFixture);

    const commission = await joKenPo.getCommission();

    expect(commission).to.equal(10);
  });

  it("Should set commission", async function () {
    const { joKenPo } = await loadFixture(deployFixture);

    await joKenPo.setCommission(20);

    const commission = await joKenPo.getCommission();

    expect(commission).to.equal(20);
  });
  it("Should NOT set commission (NOT THE OWNER)", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);

    await expect(player1Instance.setCommission(20)).to.be.revertedWith(
      "You do not have permission"
    );
  });

  it("Should NOT set commission (GAME IN PROGRESS)", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);

    await player1Instance.play(GameOptions.ROCK, { value: DEFAULT_BID });

    await expect(joKenPo.setCommission(20)).to.be.revertedWith(
      "You can not change the commission with a game in progress"
    );
  });

  it("Should get bid", async function () {
    const { joKenPo } = await loadFixture(deployFixture);
    const initialBid = ethers.parseEther("0.001");

    const bid = await joKenPo.getBid();

    expect(bid).to.equal(initialBid);
  });

  it("Should set bid", async function () {
    const { joKenPo } = await loadFixture(deployFixture);

    const newBid = ethers.parseEther("0.002");

    await joKenPo.setBid(newBid);

    const bid = await joKenPo.getBid();

    expect(bid).to.equal(newBid);
  });

  it("Should NOT set bid (NOT THE OWNER)", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);

    await expect(player1Instance.setBid(1)).to.be.revertedWith(
      "You do not have permission"
    );
  });

  it("Should NOT set bid (GAME IN PROGRESS)", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);

    const player1Instance = joKenPo.connect(player1);

    await player1Instance.play(GameOptions.ROCK, { value: DEFAULT_BID });

    await expect(joKenPo.setBid(1)).to.be.revertedWith(
      "You can not change the bid with a game in progress"
    );
  });

  it("Should play alone", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);

    await player1Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });
    const result = await joKenPo.getResult();

    expect(result).to.equal("Player 1 plays waiting player 2");
  });

  it("Should NOT play alone (IS THW OWNER)", async function () {
    const { joKenPo, owner } = await loadFixture(deployFixture);
    const ownerInstance = joKenPo.connect(owner);

    await expect(
      ownerInstance.play(GameOptions.ROCK, { value: DEFAULT_BID })
    ).to.be.revertedWith("Owner can not play");
  });

  it("Should NOT play alone (PLAYER 1 PLAYING TWICE)", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);

    await player1Instance.play(GameOptions.ROCK, { value: DEFAULT_BID });

    await expect(
      player1Instance.play(GameOptions.ROCK, { value: DEFAULT_BID })
    ).to.be.revertedWith("Player 1 can not play with himself");
  });

  it("Should NOT play alone (INVALID CHOICE)", async function () {
    const { joKenPo, player1, player2 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);
    const player2Instance = joKenPo.connect(player2);

    await expect(
      player1Instance.play(GameOptions.NONE, { value: DEFAULT_BID })
    ).to.be.revertedWith("Invalid choice");
  });

  it("Should NOT play alone (INVALID BID)", async function () {
    const { joKenPo, player1 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);

    await expect(
      player1Instance.play(GameOptions.ROCK, { value: 0 })
    ).to.be.revertedWith("Invalid bid");
  });

  it("Should play with two players (Draw)", async function () {
    const { joKenPo, player1, player2 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);
    const player2Instance = joKenPo.connect(player2);

    await player1Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    const result = await joKenPo.getResult();

    expect(result).to.equal("Draw Game, the prize was doubled");
  });

  it("Should play with two players (Player 1 Wins)", async function () {
    const { joKenPo, player1, player2 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);
    const player2Instance = joKenPo.connect(player2);

    await player1Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.SCISSORS, {
      value: DEFAULT_BID,
    });

    const result = await joKenPo.getResult();

    expect(result).to.equal("Player 1 Wins");

    await player1Instance.play(GameOptions.SCISSORS, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.PAPER, {
      value: DEFAULT_BID,
    });

    const result2 = await joKenPo.getResult();

    expect(result2).to.equal("Player 1 Wins");

    await player1Instance.play(GameOptions.PAPER, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    const result3 = await joKenPo.getResult();

    expect(result3).to.equal("Player 1 Wins");
  });

  it("Should play with two players (Player 2 Wins)", async function () {
    const { joKenPo, player1, player2 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);
    const player2Instance = joKenPo.connect(player2);

    await player1Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.PAPER, {
      value: DEFAULT_BID,
    });

    const result = await joKenPo.getResult();

    expect(result).to.equal("Player 2 Wins");
  });

  it("Should increase player 1 wins", async function () {
    const { joKenPo, player1, player2 } = await loadFixture(deployFixture);
    const player1Instance = joKenPo.connect(player1);
    const player2Instance = joKenPo.connect(player2);

    await player1Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.SCISSORS, {
      value: DEFAULT_BID,
    });
    //winners is mappging
    const player1Wins = await joKenPo.winners(player1.address);

    expect(player1Wins).to.equal(1);

    await player1Instance.play(GameOptions.ROCK, {
      value: DEFAULT_BID,
    });

    await player2Instance.play(GameOptions.SCISSORS, {
      value: DEFAULT_BID,
    });

    const player1Wins2 = await joKenPo.winners(player1.address);

    expect(player1Wins2).to.equal(2);
  });
});
