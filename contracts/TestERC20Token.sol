// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ERC20PresetMinterPauser is mintable with public function 'mint'. 
import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol";

contract TestERC20Token is ERC20PresetMinterPauserUpgradeable {

    function initialize() public initializer {
        ERC20PresetMinterPauserUpgradeable.initialize("TestERC20Token", "TET");
    }

}
