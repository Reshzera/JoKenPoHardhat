// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract JoKenPo {
    enum Choice {
        None,
        Rock,
        Paper,
        Scissors
    }
    address private player1;
    address payable private immutable owner;
    Choice private player1Choice;
    string public result;

    struct Player {
        address wallet;
        uint32 wins;
    }

    Player[] winners;

    constructor() {
        owner = payable(msg.sender);
    }

    function updateWinner(address winner) private {
        for (uint256 i; i < winners.length; i++) {
            if (winners[i].wallet == winner) {
                winners[i].wins++;
                return;
            }
        }

        winners.push(Player(winner, 1));
    }

    function finishGame(
        string memory newResult,
        address winnerAddress
    ) private {
        address contractAddress = address(this);
        payable(winnerAddress).transfer((contractAddress.balance / 100) * 90);
        owner.transfer(contractAddress.balance);

        updateWinner(winnerAddress);

        result = newResult;
        player1 = address(0);
        player1Choice = Choice.None;
    }

    function play(Choice _choice) public payable {
        require(msg.sender != player1, "Player 1 can't play with himself");
        require(_choice != Choice.None, "Invalid choice");
        require(msg.value >= 0.01 ether, "Invalid bid");

        if (player1Choice == Choice.None) {
            player1 = msg.sender;
            player1Choice = _choice;
            result = "Player 1 plays waiting player 2";
            return;
        }

        if (player1Choice == Choice.Rock && _choice == Choice.Scissors) {
            finishGame("Player 1 Wins", player1);
            return;
        }
        if (player1Choice == Choice.Scissors && _choice == Choice.Paper) {
            finishGame("Player 1 Wins", player1);
            return;
        }
        if (player1Choice == Choice.Paper && _choice == Choice.Rock) {
            finishGame("Player 1 Wins", player1);
            return;
        }
        if (player1Choice == _choice) {
            result = "Draw Game, the prize was doubled";
            return;
        }
        finishGame("Player 2 Wins", msg.sender);
    }
}
