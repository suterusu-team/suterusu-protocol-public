
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./SuterBank.sol";
import "./Utils.sol";
import "./TransferVerifier.sol";
import "./BurnVerifier.sol";
import "./SuterBase.sol";
import "./SuterFactory.sol";
import "./SuterLog.sol";

contract Suterusu {

    using Utils for uint256;
    using Utils for Utils.G1Point;
    using EnumerableMap for EnumerableMap.UintToAddressMap; 
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using SuterLog for SuterLog.Chain;

    EnumerableMap.UintToAddressMap private suters;
    EnumerableSet.Bytes32Set private users;

    SuterNativeFactory nativeFactory;
    SuterERC20Factory erc20Factory;

    address public admin;

    mapping(bytes32 => SuterLog.Chain) logChain; 

    uint totalTransactions;

    event SetAdminSuccess(address admin);
    event RegisterSuccess(bytes32[2] y_tuple);

    constructor (address _nativeFactory, address _erc20Factory) {
        admin = msg.sender;

        nativeFactory = SuterNativeFactory(_nativeFactory);
        erc20Factory = SuterERC20Factory(_erc20Factory);

        address native = nativeFactory.newSuterNative(address(this));
        suters.set(uint256(bytes32(bytes(nativeFactory.nativeSymbol()))), native); 
        SuterBase(native).setUnit(10000000000000000);
        SuterBase(native).setAgency(payable(msg.sender));
        SuterBase(native).setAdmin(msg.sender);
    }

    /**
     * @dev Throws if called by any account other than the admin.
     */
    modifier onlyAdmin() {
        require(admin == msg.sender, "Caller is not the admin");
        _;
    }

    function setAdmin (address _admin) external onlyAdmin {
        admin = _admin;
        emit SetAdminSuccess(_admin);
    }

    function getSymbols () external view returns (string[] memory) {
        uint256 size = suters.length();
        string[] memory symbols = new string[](size);
        for (uint256 i = 0; i < size; i++) {
            (uint256 key, ) = suters.at(i);
            symbols[i] = string(abi.encodePacked(bytes32(key)));
        }
        return symbols;
    }

    function getSuter(string calldata symbol) public view returns (address) {
        (, address suterAddr) = suters.tryGet(uint256(bytes32(bytes(symbol))));
        return suterAddr;
    }

    function addSuter(string calldata symbol, address token_contract_address) public onlyAdmin {
        require(!suters.contains(uint256(bytes32(bytes(symbol)))), "Suter for this token already exists");
        address erc20 = erc20Factory.newSuterERC20(address(this), token_contract_address);
        suters.set(uint256(bytes32(bytes(symbol))), erc20);
        SuterBase(erc20).setUnit(10000000000000000);
        SuterBase(erc20).setAgency(payable(msg.sender));
        SuterBase(erc20).setAdmin(msg.sender);
    }

    function token(string calldata symbol) external view returns (address) {
        return SuterBase(getSuter(symbol)).token();
    }

    function nativeSymbol() external view returns (string memory) {
        return nativeFactory.nativeSymbol();
    }

    function agency(string calldata symbol) external view returns (address) {
        return SuterBase(getSuter(symbol)).agency();
    }

    function epochBase(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).epochBase();
    }

    function epochLength(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).epochLength();
    }

    function unit(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).unit();
    }

    function burn_fee_multiplier(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).burn_fee_multiplier();
    }

    function burn_fee_dividend(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).burn_fee_dividend();
    }

    function lastGlobalUpdate(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).lastGlobalUpdate();
    }

    function lastRollOver(string calldata symbol, bytes32 yHash) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).lastRollOver(yHash);
    }

    function totalBalance(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).totalBalance();
    }

    function totalUsers() external view returns (uint256) {
        return users.length(); 
    }

    function totalBurnFee(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).totalBurnFee();
    }

    function totalTransferFee(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).totalTransferFee();
    }

    function totalDeposits(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).totalDeposits();
    }

    function totalFundCount(string calldata symbol) external view returns (uint256) {
        return SuterBase(getSuter(symbol)).totalFundCount();
    }

    //function setBurnFeeStrategy(string calldata symbol, uint256 multiplier, uint256 dividend) external onlyOwner {
        //SuterBase(getSuter(symbol)).setBurnFeeStrategy(multiplier, dividend);
    //}

    //function setTransferFeeStrategy(string calldata symbol, uint256 multiplier, uint256 dividend) external onlyOwner {
        //SuterBase(getSuter(symbol)).setTransferFeeStrategy(multiplier, dividend);
    //}

    //function setEpochBase (string calldata symbol, uint256 _epochBase) external onlyOwner {
        //SuterBase(getSuter(symbol)).setEpochBase(_epochBase);
    //}

    //function setEpochLength (string calldata symbol, uint256 _epochLength) external onlyOwner {
        //SuterBase(getSuter(symbol)).setEpochLength(_epochLength);
    //}

    //function setUnit (string calldata symbol, uint256 _unit) external onlyOwner {
        //SuterBase(getSuter(symbol)).setUnit(_unit);
    //}

    //function setSuterAgency (string calldata symbol, address payable _suterAgency) external onlyOwner {
        //SuterBase(getSuter(symbol)).setSuterAgency(_suterAgency);
    //}

    function registered(bytes32 yHash) public view returns (bool) {
        return users.contains(yHash);
    }

    function registered(bytes32[2] calldata y) public view returns (bool) {
        bytes32 yHash = keccak256(abi.encode(y));
        return registered(yHash);
    }

    function register(bytes32[2] calldata y_tuple, uint256 c, uint256 s) external {

        Utils.G1Point memory y = Utils.G1Point(y_tuple[0], y_tuple[1]);
        // allows y to participate. c, s should be a Schnorr signature on "this"
        Utils.G1Point memory K = Utils.g().pMul(s).pAdd(y.pMul(c.gNeg()));
        uint256 challenge = uint256(keccak256(abi.encode(address(this), y, K))).gMod();
        require(challenge == c, "Invalid signature!");
        bytes32 yHash = keccak256(abi.encode(y));
        require(!registered(yHash), "Account already registered!");

        users.add(yHash);

        totalTransactions += 1;
        emit RegisterSuccess(y_tuple);
    }

    function getBalance(string calldata symbol, bytes32[2][] calldata y_tuples, uint256 epoch) external view returns (bytes32[2][2][] memory accounts) {
        return SuterBase(getSuter(symbol)).getBalance(y_tuples, epoch);
    }

    function getAccountState (string calldata symbol, bytes32[2] calldata y) external view returns (bytes32[2][2] memory y_available, bytes32[2][2] memory y_pending) {
        return SuterBase(getSuter(symbol)).getAccountState(y); 
    }

    function getGuess (string calldata symbol, bytes32[2] memory y) public view returns (bytes memory y_guess) {
        return SuterBase(getSuter(symbol)).getGuess(y);
    }

    function currentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function currentEpoch(string calldata symbol) public view returns (uint256) {
        return SuterBase(getSuter(symbol)).currentEpoch();
    }

    function fund(string calldata symbol, bytes32[2] calldata y, uint256 unitAmount, bytes calldata encGuess) external payable {
        require(registered(y), "Account not yet registered.");
        address suterAddr = getSuter(symbol);
        SuterBase(suterAddr).fund{value: msg.value}(y, unitAmount, encGuess);

        getLogChain(y).push(symbol, SuterLog.Activity.Fund, msg.sender, suterAddr, unitAmount, block.timestamp);
        totalTransactions += 1;
    }

    function burn(string calldata symbol, bytes32[2] calldata y, uint256 unitAmount, bytes32[2] calldata u, bytes calldata proof, bytes calldata encGuess) external {
        require(registered(y), "Account not yet registered.");
        address suterAddr = getSuter(symbol);
        {
            SuterBase(suterAddr).burnTo(msg.sender, y, unitAmount, u, proof, encGuess);
        }
        {// Logging
            SuterLog.Item memory item = SuterLog.Item({
                symbol: symbol, 
                activity: SuterLog.Activity.Burn, 
                addr1: suterAddr,
                addr2: msg.sender,
                amount: unitAmount,
                timestamp: block.timestamp 
            });
            getLogChain(y).push(item);
        }
        totalTransactions += 1;
    }

    function burnTo(string calldata symbol, address sink, bytes32[2] calldata y, uint256 unitAmount, bytes32[2] memory u, bytes memory proof, bytes memory encGuess) external {
        require(registered(y), "Account not yet registered.");
        address suterAddr = getSuter(symbol);
        {
            SuterBase(suterAddr).burnTo(sink, y, unitAmount, u, proof, encGuess);
        }
        {// Logging
            SuterLog.Item memory item = SuterLog.Item({
                symbol: symbol, 
                activity: SuterLog.Activity.Burn, 
                addr1: suterAddr,
                addr2: sink,
                amount: unitAmount,
                timestamp: block.timestamp 
            });
            getLogChain(y).push(item);
        }
        totalTransactions += 1;
    }


    function transfer(string calldata symbol, bytes32[2][] memory C_tuples, bytes32[2] memory D_tuple, 
                      bytes32[2][] calldata y_tuples, bytes32[2] memory u_tuple, 
                      bytes calldata proof) external payable {
        for (uint i = 0; i < y_tuples.length; i++)
            require(registered(y_tuples[i]), "Account not yet registered.");
        
        address suterAddr = getSuter(symbol);
        {
            SuterBase(suterAddr).transfer{value: msg.value}(C_tuples, D_tuple, y_tuples, u_tuple, proof);
        }

        {// Logging
            for (uint i = 0; i < y_tuples.length; i++) {
                SuterLog.Item memory item = SuterLog.Item({
                    symbol: symbol, 
                    activity: SuterLog.Activity.Transfer, 
                    addr1: suterAddr,
                    addr2: msg.sender,
                    amount: 0,
                    timestamp: block.timestamp 
                });
                getLogChain(y_tuples[i]).push(item);
            }
        }

        totalTransactions += 1;
    }

    function getLogChain(bytes32[2] calldata y) internal view returns (SuterLog.Chain storage chain) {
        bytes32 yHash = keccak256(abi.encode(y));
        return logChain[yHash]; 
    }

    function recentLog(bytes32[2] calldata y, uint n) external view returns (SuterLog.Item[] memory items) {
        return getLogChain(y).top(n);
    }

}


