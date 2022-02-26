// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ERC20PresetMinterPauser is mintable with public function 'mint'. 
//import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract TestERC20Token is ERC20PresetMinterPauser {

    constructor () ERC20PresetMinterPauser("TestERC20Token", "TET") {
        //ERC20PresetMinterPauserUpgradeable.initialize("TestERC20Token", "TET");
    }

}
