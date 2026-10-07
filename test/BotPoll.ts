import { expect } from "chai";
import { ethers } from "hardhat";
import { BotPoll } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BotPoll", function () {
  let botPoll: BotPoll;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const BotPollFactory = await ethers.getContractFactory("BotPoll");
    botPoll = await BotPollFactory.deploy();
    await botPoll.waitForDeployment();
  });

  describe("Poll Creation", function () {
    it("should create a valid poll and emit PollCreated", async function () {
      const question = "Which Web3 feature should we build next?";
      const options = ["Payments", "Gaming", "Social", "DeFi"];

      const tx = await botPoll.createPoll(question, options);
      await expect(tx)
        .to.emit(botPoll, "PollCreated")
        .withArgs(1, owner.address, question);

      const pollCount = await botPoll.getPollCount();
      expect(pollCount).to.equal(1);

      const poll = await botPoll.getPoll(1);
      expect(poll.id).to.equal(1);
      expect(poll.creator).to.equal(owner.address);
      expect(poll.question).to.equal(question);
      expect(poll.optionCount).to.equal(4);
      expect(poll.active).to.be.true;

      const pollOptions = await botPoll.getPollOptions(1);
      expect(pollOptions.length).to.equal(4);
      expect(pollOptions[0].text).to.equal("Payments");
      expect(pollOptions[0].voteCount).to.equal(0);
      expect(pollOptions[1].text).to.equal("Gaming");
      expect(pollOptions[2].text).to.equal("Social");
      expect(pollOptions[3].text).to.equal("DeFi");
    });

    it("should reject poll creation with empty question", async function () {
      await expect(
        botPoll.createPoll("", ["Option A", "Option B"])
      ).to.be.revertedWith("Question cannot be empty");
    });

    it("should reject poll creation with less than 2 options", async function () {
      await expect(
        botPoll.createPoll("Single option?", ["Only One"])
      ).to.be.revertedWith("Minimum 2 options required");
    });

    it("should reject poll creation with more than 4 options", async function () {
      await expect(
        botPoll.createPoll("Too many options?", [
          "Opt 1",
          "Opt 2",
          "Opt 3",
          "Opt 4",
          "Opt 5",
        ])
      ).to.be.revertedWith("Maximum 4 options allowed");
    });

    it("should reject poll creation with empty option", async function () {
      await expect(
        botPoll.createPoll("Empty option?", ["Valid Opt", ""])
      ).to.be.revertedWith("Option text cannot be empty");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await botPoll.createPoll("Which Web3 feature should we build next?", [
        "Payments",
        "Gaming",
        "Social",
        "DeFi",
      ]);
    });

    it("should allow a successful vote, increase vote count, and emit VoteCast", async function () {
      const tx = await botPoll.connect(voter1).vote(1, 0);
      await expect(tx)
        .to.emit(botPoll, "VoteCast")
        .withArgs(1, 0, voter1.address);

      const hasVoted = await botPoll.hasAddressVoted(1, voter1.address);
      expect(hasVoted).to.be.true;

      const options = await botPoll.getPollOptions(1);
      expect(options[0].voteCount).to.equal(1);
      expect(options[1].voteCount).to.equal(0);
    });

    it("should reject double voting by the same wallet", async function () {
      await botPoll.connect(voter1).vote(1, 0);

      await expect(
        botPoll.connect(voter1).vote(1, 1)
      ).to.be.revertedWith("Already voted on this poll");
    });

    it("should reject voting for an invalid option", async function () {
      await expect(
        botPoll.connect(voter1).vote(1, 4) // valid options are 0..3
      ).to.be.revertedWith("Invalid option ID");
    });

    it("should reject voting on a nonexistent poll", async function () {
      await expect(
        botPoll.connect(voter1).vote(999, 0)
      ).to.be.revertedWith("Poll does not exist");
    });
  });

  describe("Closing Poll", function () {
    beforeEach(async function () {
      await botPoll.createPoll("Feature poll", ["Yes", "No"]);
    });

    it("should allow creator to close the poll and emit PollClosed", async function () {
      const tx = await botPoll.connect(owner).closePoll(1);
      await expect(tx)
        .to.emit(botPoll, "PollClosed")
        .withArgs(1);

      const poll = await botPoll.getPoll(1);
      expect(poll.active).to.be.false;
    });

    it("should reject non-creator from closing the poll", async function () {
      await expect(
        botPoll.connect(voter1).closePoll(1)
      ).to.be.revertedWith("Only creator can close poll");
    });

    it("should reject voting on a closed poll", async function () {
      await botPoll.connect(owner).closePoll(1);

      await expect(
        botPoll.connect(voter1).vote(1, 0)
      ).to.be.revertedWith("Poll is not active");
    });
  });
});
