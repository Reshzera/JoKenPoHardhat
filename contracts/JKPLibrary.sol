// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library JKPLibrary {
    enum Choice {
        None,
        Rock,
        Paper,
        Scissors
    }

    struct Player {
        address playerAddress;
        uint256 totalEarnings;
        uint128 totalWins;
    }
}
