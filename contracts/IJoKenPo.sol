// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./JKPLibrary.sol";

interface IJoKenPo {
    function getCommission() external view returns (uint8);

    function setCommission(uint8 _newCommission) external;

    function getBid() external view returns (uint256);

    function setBid(uint256 _newBid) external;

    function getResult() external view returns (string memory);

    function getWinners() external view returns (JKPLibrary.Player[] memory);

    function play(
        JKPLibrary.Choice _choice
    ) external payable returns (string memory);
}
