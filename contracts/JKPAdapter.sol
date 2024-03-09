// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./IJoKenPo.sol";
import "./JKPLibrary.sol";

contract JKPAdapter {
    IJoKenPo private joKenPo;
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    //admin functions
    function getImplementationAddress()
        external
        view
        upgraded
        returns (address)
    {
        return address(joKenPo);
    }

    function upgradeImplementation(address jkpAddress) external restricted {
        require(jkpAddress != address(0), "address should not be empty");

        joKenPo = IJoKenPo(jkpAddress);
    }

    //JKP Functions
    function play(JKPLibrary.Choice _choice) external payable upgraded {
        return joKenPo.play{value: msg.value}(_choice);
    }

    function getResult() external view upgraded returns (string memory) {
        return joKenPo.getResult();
    }

    function getCommission() external view upgraded returns (uint8) {
        return joKenPo.getCommission();
    }

    function setCommission(uint8 _newCommission) external restricted upgraded {
        return joKenPo.setCommission(_newCommission);
    }

    function getBid() external view upgraded returns (uint256) {
        return joKenPo.getBid();
    }

    function setBid(uint256 _newBid) external restricted upgraded {
        return joKenPo.setBid(_newBid);
    }

    modifier upgraded() {
        require(address(joKenPo) != address(0), "Contract is upgrading");
        _;
    }

    modifier restricted() {
        require(msg.sender == owner, "You do not have permission");
        _;
    }
}
