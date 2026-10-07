// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BotPoll
 * @notice Simple on-chain polling contract for Botchain Testnet.
 */
contract BotPoll {
    struct Poll {
        uint256 id;
        address creator;
        string question;
        uint256 optionCount;
        uint256 createdAt;
        bool active;
    }

    struct Option {
        uint256 id;
        string text;
        uint256 voteCount;
    }

    uint256 public pollCount;

    mapping(uint256 => Poll) public polls;
    mapping(uint256 => Option[]) private pollOptions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event PollCreated(
        uint256 indexed pollId,
        address indexed creator,
        string question
    );

    event VoteCast(
        uint256 indexed pollId,
        uint256 indexed optionId,
        address indexed voter
    );

    event PollClosed(
        uint256 indexed pollId
    );

    /**
     * @notice Creates a new poll.
     * @param question The poll question (1 to 280 characters).
     * @param options The poll options (2 to 4 options, each 1 to 100 characters).
     */
    function createPoll(
        string calldata question,
        string[] calldata options
    ) external returns (uint256) {
        bytes memory questionBytes = bytes(question);
        require(questionBytes.length > 0, "Question cannot be empty");
        require(questionBytes.length <= 280, "Question too long");

        require(options.length >= 2, "Minimum 2 options required");
        require(options.length <= 4, "Maximum 4 options allowed");

        pollCount++;
        uint256 newPollId = pollCount;

        polls[newPollId] = Poll({
            id: newPollId,
            creator: msg.sender,
            question: question,
            optionCount: options.length,
            createdAt: block.timestamp,
            active: true
        });

        for (uint256 i = 0; i < options.length; i++) {
            bytes memory optionBytes = bytes(options[i]);
            require(optionBytes.length > 0, "Option text cannot be empty");
            require(optionBytes.length <= 100, "Option text too long");

            pollOptions[newPollId].push(Option({
                id: i,
                text: options[i],
                voteCount: 0
            }));
        }

        emit PollCreated(newPollId, msg.sender, question);
        return newPollId;
    }

    /**
     * @notice Casts a vote for an option in a poll.
     * @param pollId The ID of the poll.
     * @param optionId The ID of the option (0-indexed).
     */
    function vote(uint256 pollId, uint256 optionId) external {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist");
        Poll storage poll = polls[pollId];
        require(poll.active, "Poll is not active");
        require(optionId < poll.optionCount, "Invalid option ID");
        require(!hasVoted[pollId][msg.sender], "Already voted on this poll");

        hasVoted[pollId][msg.sender] = true;
        pollOptions[pollId][optionId].voteCount++;

        emit VoteCast(pollId, optionId, msg.sender);
    }

    /**
     * @notice Closes a poll. Only the creator can close it.
     * @param pollId The ID of the poll to close.
     */
    function closePoll(uint256 pollId) external {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist");
        Poll storage poll = polls[pollId];
        require(msg.sender == poll.creator, "Only creator can close poll");
        require(poll.active, "Poll is already closed");

        poll.active = false;

        emit PollClosed(pollId);
    }

    /**
     * @notice Retrieves poll details.
     * @param pollId The ID of the poll.
     */
    function getPoll(uint256 pollId) external view returns (Poll memory) {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist");
        return polls[pollId];
    }

    /**
     * @notice Retrieves all options for a poll.
     * @param pollId The ID of the poll.
     */
    function getPollOptions(uint256 pollId) external view returns (Option[] memory) {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist");
        return pollOptions[pollId];
    }

    /**
     * @notice Returns the total number of polls created.
     */
    function getPollCount() external view returns (uint256) {
        return pollCount;
    }

    /**
     * @notice Checks if an address has voted on a specific poll.
     * @param pollId The ID of the poll.
     * @param voter The address to check.
     */
    function hasAddressVoted(uint256 pollId, address voter) external view returns (bool) {
        return hasVoted[pollId][voter];
    }
}
