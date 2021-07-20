// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract CheckSuter  {

    struct G1Point {
        bytes32 x;
        bytes32 y;
    }

    function test() public view returns (bool) {
        G1Point memory x = pAdd(g(), g()); 
        G1Point memory y = pMul(g(), 2);
        return pEqual(x, y);
    }

    function pAdd(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        assembly {
            let m := mload(0x40)
            mstore(m, mload(p1))
            mstore(add(m, 0x20), mload(add(p1, 0x20)))
            mstore(add(m, 0x40), mload(p2))
            mstore(add(m, 0x60), mload(add(p2, 0x20)))
            // Address of the desired EC ADD instruction: 0x06
            // Reference: https://eips.ethereum.org/EIPS/eip-196#implementation
            if iszero(staticcall(gas(), 0x06, m, 0x80, r, 0x40)) {
                revert(0, 0)
            }
        }
    }

    function pMul(G1Point memory p, uint256 s) internal view returns (G1Point memory r) {
        assembly {
            let m := mload(0x40)
            mstore(m, mload(p))
            mstore(add(m, 0x20), mload(add(p, 0x20)))
            mstore(add(m, 0x40), s)
            // Address of the desired EC MUL instruction: 0x07
            // Reference: https://eips.ethereum.org/EIPS/eip-196#implementation
            if iszero(staticcall(gas(), 0x07, m, 0x60, r, 0x40)) {
                revert(0, 0)
            }
        }
    }
    
    function g() internal pure returns (G1Point memory) {
        return G1Point(0x077da99d806abd13c9f15ece5398525119d11e11e9836b2ee7d23f6159ad87d4, 0x01485efa927f2ad41bff567eec88f32fb0a0f706588b4e41a8d587d008b7f875);
    }

    function h() internal pure returns (G1Point memory) {
        return G1Point(0x01b7de3dcf359928dd19f643d54dc487478b68a5b2634f9f1903c9fb78331aef, 0x2bda7d3ae6a557c716477c108be0d0f94abc6c4dc6b1bd93caccbcceaaa71d6b);
    }

    function pEqual(G1Point memory p1, G1Point memory p2) internal pure returns (bool) {
        return p1.x == p2.x && p1.y == p2.y;
    }


}
