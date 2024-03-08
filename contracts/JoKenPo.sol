// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract JoKenPo {
    enum Choice {
        None,
        Rock,
        Paper,
        Scissors
    }
    address private _player1;
    address payable private immutable _owner;
    Choice private _player1Choice;
    string private _result;
    uint256 private _bid = 0.001 ether;
    uint8 private _commission = 10;
    mapping(address => uint128) public winners;

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

    function updateWinner(address winner) private {
        if (winners[winner] != 0) {
            winners[winner]++;
            return;
        }
        winners[winner] = 1;
    }

    function finishGame(
        string memory newResult,
        address winnerAddress
    ) private {
        address contractAddress = address(this);
        payable(winnerAddress).transfer(
            (contractAddress.balance / 100) * (100 - _commission)
        );
        _owner.transfer(contractAddress.balance);

        updateWinner(winnerAddress);

        _result = newResult;
        _player1 = address(0);
        _player1Choice = Choice.None;
    }

    function play(Choice _choice) external payable {
        require(msg.sender != _owner, "Owner can not play");
        require(msg.sender != _player1, "Player 1 can not play with himself");
        require(_choice != Choice.None, "Invalid choice");
        require(msg.value >= _bid, "Invalid bid");

        if (_player1Choice == Choice.None) {
            _player1 = msg.sender;
            _player1Choice = _choice;
            _result = "Player 1 plays waiting player 2";
            return;
        }

        if (_player1Choice == Choice.Rock && _choice == Choice.Scissors) {
            finishGame("Player 1 Wins", _player1);
            return;
        }
        if (_player1Choice == Choice.Scissors && _choice == Choice.Paper) {
            finishGame("Player 1 Wins", _player1);
            return;
        }
        if (_player1Choice == Choice.Paper && _choice == Choice.Rock) {
            finishGame("Player 1 Wins", _player1);
            return;
        }
        if (_player1Choice == _choice) {
            _result = "Draw Game, the prize was doubled";
            return;
        }
        finishGame("Player 2 Wins", msg.sender);
    }

    modifier restricted() {
        require(msg.sender == _owner, "You do not have permission");
        _;
    }
}
