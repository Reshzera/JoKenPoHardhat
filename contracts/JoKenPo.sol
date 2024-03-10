// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./IJoKenPo.sol";
import "./JKPLibrary.sol";
//import console.sol
import "hardhat/console.sol";

contract JoKenPo is IJoKenPo {
    address private _player1;
    address payable private immutable _owner;
    JKPLibrary.Choice private _player1Choice = JKPLibrary.Choice.None;
    string private _result = "";
    uint256 private _bid = 0.001 ether;
    uint8 private _commission = 10;
    JKPLibrary.Player[] private _winners;

    constructor() {
        _owner = payable(msg.sender);
    }

    function getCommission() external view returns (uint8) {
        return _commission;
    }

    function setCommission(uint8 _newCommission) external restricted {
        require(
            _player1 == address(0),
            "You can not change the commission with a game in progress"
        );
        _commission = _newCommission;
    }

    function getBid() external view returns (uint256) {
        return _bid;
    }

    function setBid(uint256 _newBid) external restricted {
        require(
            _player1 == address(0),
            "You can not change the bid with a game in progress"
        );
        _bid = _newBid;
    }

    function getResult() external view returns (string memory) {
        return _result;
    }

    function updateWinner(address _winner, uint256 _earning) private {
        for (uint i = 0; i < _winners.length; i++) {
            if (_winners[i].playerAddress == _winner) {
                _winners[i].totalWins++;
                _winners[i].totalEarnings += _earning;
                return;
            }
        }
        _winners.push(JKPLibrary.Player(_winner, _earning, 1));
    }

    function getWinners() external view returns (JKPLibrary.Player[] memory) {
        return _winners;
    }

    function finishGame(
        string memory newResult,
        address winnerAddress
    ) private {
        address contractAddress = address(this);
        uint256 toPlayer = (contractAddress.balance / 100) *
            (100 - _commission);
        payable(winnerAddress).transfer(toPlayer);
        _owner.transfer(contractAddress.balance);

        updateWinner(winnerAddress, toPlayer);

        _result = newResult;
        _player1 = address(0);
        _player1Choice = JKPLibrary.Choice.None;
    }

    function play(
        JKPLibrary.Choice _choice
    ) external payable returns (string memory) {
        require(tx.origin != _owner, "Owner can not play");
        require(tx.origin != _player1, "Player 1 can not play with himself");
        require(_choice != JKPLibrary.Choice.None, "Invalid choice");
        require(msg.value >= _bid, "Invalid bid");

        if (_player1Choice == JKPLibrary.Choice.None) {
            _player1 = tx.origin;
            _player1Choice = _choice;
            _result = "Player 1 plays waiting player 2";
            return _result;
        }

        if (
            _player1Choice == JKPLibrary.Choice.Rock &&
            _choice == JKPLibrary.Choice.Scissors
        ) {
            finishGame("Player 1 Wins", _player1);
            return _result;
        }
        if (
            _player1Choice == JKPLibrary.Choice.Scissors &&
            _choice == JKPLibrary.Choice.Paper
        ) {
            finishGame("Player 1 Wins", _player1);
            return _result;
        }
        if (
            _player1Choice == JKPLibrary.Choice.Paper &&
            _choice == JKPLibrary.Choice.Rock
        ) {
            finishGame("Player 1 Wins", _player1);
            return _result;
        }
        if (_player1Choice == _choice) {
            _result = "Draw Game, the prize was doubled";
            return _result;
        }
        finishGame("Player 2 Wins", tx.origin);
        return _result;
    }

    modifier restricted() {
        require(tx.origin == _owner, "You do not have permission");
        _;
    }
}
