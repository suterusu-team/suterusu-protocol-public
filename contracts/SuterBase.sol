// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./SuterBank.sol";
import "./Utils.sol";
import "./TransferVerifier.sol";
import "./BurnVerifier.sol";

contract SuterBase is OwnableUpgradeable {

    using Utils for uint256;
    using Utils for Utils.G1Point;

    Suter.SuterBank bank;

    /*
       DON't add any state variable after this point, otherwise it will break the contract due to Proxy Upgradeability.
    */

    event RegisterSuccess(bytes32[2] y_tuple);
    event FundSuccess(bytes32[2] y, uint256 unitAmount);
    event BurnSuccess(bytes32[2] y, uint256 unitAmount);
    event TransferSuccess(bytes32[2][] parties);
    event SetBurnFeeStrategySuccess(uint256 multiplier, uint256 dividend);
    event SetTransferFeeStrategySuccess(uint256 multiplier, uint256 dividend);
    event SetEpochBaseSuccess(uint256 epochBase);
    event SetEpochLengthSuccess(uint256 epochLength);
    event SetUnitSuccess(uint256 unit);
    event SetSuterAgencySuccess(address suterAgency);
    event SetERC20TokenSuccess(address token);

    function initializeBase(address _transfer, address _burn) public initializer {
        OwnableUpgradeable.__Ownable_init();
        bank.suterAgency = payable(msg.sender);
        bank.transferverifier = TransferVerifier(_transfer);
        bank.burnverifier = BurnVerifier(_burn);
        
        bank.unit = 10**16;
        bank.MAX = 2**32 - 1;
        bank.lastGlobalUpdate = 0;
        bank.epochBase = 0;
        bank.epochLength = 24;
        
        bank.BURN_FEE_MULTIPLIER = 1;
        bank.BURN_FEE_DIVIDEND = 100;
        bank.TRANSFER_FEE_MULTIPLIER = 1;
        bank.TRANSFER_FEE_DIVIDEND = 5;

        bank.totalBalance = 0;
        bank.totalUsers = 0;
        bank.totalBurnFee = 0;
        bank.totalTransferFee = 0;
        bank.totalDeposits = 0;
        bank.totalFundCount = 0;

        bank.newEpoch = -1;
    }

    function toUnitAmount(uint256 nativeAmount) internal view returns (uint256) {
        require(nativeAmount % bank.unit == 0, "Native amount must be multiple of a unit.");
        uint256 amount = nativeAmount / bank.unit;
        require(0 <= amount && amount <= bank.MAX, "Amount out of range."); 
        return amount;
    }

    function toNativeAmount(uint256 unitAmount) internal view returns (uint256) {
        require(0 <= unitAmount && unitAmount <= bank.MAX, "Amount out of range");
        return unitAmount * bank.unit;
    }

    function suterAgency() external view returns (address) {
        return bank.suterAgency;
    }

    function epochBase() external view returns (uint256) {
        return bank.epochBase;
    }

    function epochLength() external view returns (uint256) {
        return bank.epochLength;
    }

    function unit() external view returns (uint256) {
        return bank.unit;
    }

    function lastGlobalUpdate() external view returns (uint256) {
        return bank.lastGlobalUpdate;
    }

    function lastRollOver(bytes32 yHash) external view returns (uint256) {
        return bank.lastRollOver[yHash];
    }

    function totalBalance() external view returns (uint256) {
        return bank.totalBalance;
    }

    function totalUsers() external view returns (uint256) {
        return bank.totalUsers;
    }

    function totalBurnFee() external view returns (uint256) {
        return bank.totalBurnFee;
    }

    function totalTransferFee() external view returns (uint256) {
        return bank.totalTransferFee;
    }

    function totalDeposits() external view returns (uint256) {
        return bank.totalDeposits;
    }

    function totalFundCount() external view returns (uint256) {
        return bank.totalFundCount;
    }

    function setBurnFeeStrategy(uint256 multiplier, uint256 dividend) external onlyOwner {
        bank.BURN_FEE_MULTIPLIER = multiplier;
        bank.BURN_FEE_DIVIDEND = dividend;

        emit SetBurnFeeStrategySuccess(multiplier, dividend);
    }

    function setTransferFeeStrategy(uint256 multiplier, uint256 dividend) external onlyOwner {
        bank.TRANSFER_FEE_MULTIPLIER = multiplier;
        bank.TRANSFER_FEE_DIVIDEND = dividend;

        emit SetTransferFeeStrategySuccess(multiplier, dividend);
    }

    function setEpochBase (uint256 _epochBase) external onlyOwner {
        bank.epochBase = _epochBase;
        bank.newEpoch = int256(currentEpoch());

        emit SetEpochBaseSuccess(_epochBase);
    }

    function setEpochLength (uint256 _epochLength) external onlyOwner {
        bank.epochLength = _epochLength;
        bank.newEpoch = int256(currentEpoch());

        emit SetEpochLengthSuccess(_epochLength);
    }

    function setUnit (uint256 _unit) external onlyOwner {
        bank.unit = _unit;

        emit SetUnitSuccess(_unit);
    }

    function setSuterAgency (address payable _suterAgency) external onlyOwner {
        bank.suterAgency = _suterAgency;

        emit SetSuterAgencySuccess(_suterAgency);
    }

    function register(bytes32[2] calldata y_tuple, uint256 c, uint256 s) external {
        Utils.G1Point memory y = Utils.G1Point(y_tuple[0], y_tuple[1]);
        // allows y to participate. c, s should be a Schnorr signature on "this"
        Utils.G1Point memory K = Utils.g().pMul(s).pAdd(y.pMul(c.gNeg()));
        uint256 challenge = uint256(keccak256(abi.encode(address(this), y, K))).gMod();
        require(challenge == c, "Invalid registration signature!");
        bytes32 yHash = keccak256(abi.encode(y));
        require(!registered(yHash), "Account already registered!");

        /*
            The following initial value of pending[yHash] is equivalent to an ElGamal encryption of m = 0, with nonce r = 1:
            (mG + ry, rG) --> (y, G)
            If we don't set pending in this way, then we can't differentiate two cases:
            1. The account is not registered (both acc and pending are 0, because `mapping` has initial value for all keys)
            2. The account has a total balance of 0 (both acc and pending are 0)

            With such a setting, we can guarantee that, once an account is registered, its `acc` and `pending` can never (crytographically negligible) BOTH equal to Point zero.
            NOTE: `pending` can be reset to Point zero after a roll over.
        */
        bank.pending[yHash][0] = y;
        bank.pending[yHash][1] = Utils.g();

        bank.totalUsers = bank.totalUsers + 1;

        emit RegisterSuccess(y_tuple);
    }

    function registered(bytes32 yHash) public view returns (bool) {
        Utils.G1Point memory zero = Utils.G1Point(0, 0);
        Utils.G1Point[2][2] memory scratch = [bank.acc[yHash], bank.pending[yHash]];
        return !(scratch[0][0].pEqual(zero) && scratch[0][1].pEqual(zero) && scratch[1][0].pEqual(zero) && scratch[1][1].pEqual(zero));
    }

    /**
      Get the current balances of accounts. If the given `epoch` is larger than the last roll over epoch, the returned balances
      will include pending transfers. 
    */
    function getBalance(bytes32[2][] calldata y_tuples, uint256 epoch) external view returns (bytes32[2][2][] memory accounts) {
        // in this function and others, i have to use public + memory (and hence, a superfluous copy from calldata)
        // only because calldata structs aren't yet supported by solidity. revisit this in the future.
        uint256 size = y_tuples.length;
        accounts = new bytes32[2][2][](size);
        for (uint256 i = 0; i < size; i++) {
            bytes32 yHash = keccak256(abi.encode(y_tuples[i]));
            Utils.G1Point[2] memory account = bank.acc[yHash];
            if (bank.lastRollOver[yHash] < epoch || bank.newEpoch >= 0) {
                Utils.G1Point[2] memory scratch = bank.pending[yHash];
                account[0] = account[0].pAdd(scratch[0]);
                account[1] = account[1].pAdd(scratch[1]);
            }
            accounts[i] = [[account[0].x, account[0].y], [account[1].x, account[1].y]];
        }
    }

    function getAccountState (bytes32[2] calldata y) external view returns (bytes32[2][2] memory y_available, bytes32[2][2] memory y_pending) {
        bytes32 yHash = keccak256(abi.encode(y));
        Utils.G1Point[2] memory tmp = bank.acc[yHash];
        y_available = [[tmp[0].x, tmp[0].y], [tmp[1].x, tmp[1].y]];
        tmp = bank.pending[yHash];
        y_pending = [[tmp[0].x, tmp[0].y], [tmp[1].x, tmp[1].y]]; 
    }

    function getGuess (bytes32[2] memory y) public view returns (bytes memory y_guess) {
        bytes32 yHash = keccak256(abi.encode(y));
        y_guess = bank.guess[yHash];
        return y_guess;
    }

    function currentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function currentEpoch() public view returns (uint256) {
        uint256 e = 0;
        if (bank.epochBase == 0)
            e = block.number / bank.epochLength;
        else if (bank.epochBase == 1)
            // This is really BAD for local testing. Because the block doesn't advance in a local chain, hence the timestamp is also the same...
            e = block.timestamp / bank.epochLength;
        else
            revert("Invalid epoch base.");
        return e;
    }

    function rollOver(bytes32 yHash) internal {
        uint256 e = currentEpoch();

        if (bank.lastRollOver[yHash] < e || bank.newEpoch >= 0) {
            // Only allow at most a single roll over for each account in each epoch.
            // Otherwise, there is a higher chance of proof verification failed, if, for example, 
            // someone else makes a transfer to the current account, but the current account has submitted a
            // transaction with proof that works on the previous available balance.

            Utils.G1Point[2][2] memory scratch = [bank.acc[yHash], bank.pending[yHash]];
            bank.acc[yHash][0] = scratch[0][0].pAdd(scratch[1][0]);
            bank.acc[yHash][1] = scratch[0][1].pAdd(scratch[1][1]);
            delete bank.pending[yHash]; // Equivalent to: pending[yHash] = [Utils.G1Point(0, 0), Utils.G1Point(0, 0)];
            bank.lastRollOver[yHash] = e;
        }
        if (bank.lastGlobalUpdate < e || bank.newEpoch >= 0) {
            bank.lastGlobalUpdate = e;
            delete bank.nonceSet;
        }
        bank.newEpoch = -1;
    }

    function fundBase(bytes32[2] calldata y_tuple, uint256 amount, bytes calldata encGuess) internal {

        require(amount <= bank.MAX && bank.totalBalance + amount <= bank.MAX, "Fund pushes contract past maximum value.");
        bank.totalBalance += amount;
        bank.totalDeposits += amount;
        bank.totalFundCount += 1;

        bytes32 yHash = keccak256(abi.encode(y_tuple));
        require(registered(yHash), "Account not yet registered.");
        rollOver(yHash);

        Utils.G1Point memory scratch = bank.pending[yHash][0];
        scratch = scratch.pAdd(Utils.g().pMul(amount));
        bank.pending[yHash][0] = scratch;

        bank.guess[yHash] = encGuess;
    }

    function burnBase(bytes32[2] memory y_tuple, uint256 amount, bytes32[2] memory u_tuple, bytes memory proof, bytes memory encGuess) internal {

        require(bank.totalBalance >= amount, "Burn fails the sanity check.");
        bank.totalBalance -= amount;
        
        Utils.G1Point memory y = Utils.toPoint(y_tuple);
        Utils.G1Point memory u = Utils.toPoint(u_tuple);

        bytes32 yHash = keccak256(abi.encode(y));
        require(registered(yHash), "Account not yet registered.");
        rollOver(yHash);

        Utils.G1Point[2] memory scratch = bank.pending[yHash];
        bank.pending[yHash][0] = scratch[0].pAdd(Utils.g().pMul(amount.gNeg()));

        scratch = bank.acc[yHash]; // simulate debit of acc---just for use in verification, won't be applied
        scratch[0] = scratch[0].pAdd(Utils.g().pMul(amount.gNeg()));

        // Check nonce
        validateNonce(u_tuple);

        bank.guess[yHash] = encGuess;

        require(bank.burnverifier.verifyBurn(scratch[0], scratch[1], y, bank.lastGlobalUpdate, u, msg.sender, proof), "Burn verification failed!");
    }

    function transfer(bytes32[2][] memory C_tuples, bytes32[2] memory D_tuple, 
                      bytes32[2][] memory y_tuples, bytes32[2] memory u_tuple, 
                      bytes calldata proof) external payable {

        uint256 startGas = gasleft();
        
        // Check nonce
        validateNonce(u_tuple);
        
        TransferVerifier.TransferStatement memory statement;

        // TODO: check that sender and receiver should NOT be equal.
        uint256 size = y_tuples.length;
        statement.CLn = new Utils.G1Point[](size);
        statement.CRn = new Utils.G1Point[](size);
        require(C_tuples.length == size, "Input array length mismatch!");

        statement.C = new Utils.G1Point[](size);
        statement.y = new Utils.G1Point[](size);
        for (uint256 i = 0; i < size; i++) {
            statement.C[i] = Utils.toPoint(C_tuples[i]);
            statement.y[i] = Utils.toPoint(y_tuples[i]);
        }
        statement.D = Utils.toPoint(D_tuple);

        for (uint256 i = 0; i < size; i++) {
            bytes32 yHash = keccak256(abi.encode(y_tuples[i]));
            require(registered(yHash), "Account not yet registered.");
            rollOver(yHash);

            Utils.G1Point[2] memory scratch = bank.pending[yHash];

            bank.pending[yHash][0] = scratch[0].pAdd(statement.C[i]);
            bank.pending[yHash][1] = scratch[1].pAdd(statement.D);

            scratch = bank.acc[yHash];
            statement.CLn[i] = scratch[0].pAdd(statement.C[i]); 
            statement.CRn[i] = scratch[1].pAdd(statement.D);
        }


        statement.epoch = bank.lastGlobalUpdate;
        statement.u = Utils.toPoint(u_tuple);

        require(bank.transferverifier.verify(statement, proof),
            "Transfer verification failed!");

        // Charge fee
        {
            uint256 usedGas = startGas - gasleft();
            
            uint256 fee = (usedGas * bank.TRANSFER_FEE_MULTIPLIER / bank.TRANSFER_FEE_DIVIDEND) * tx.gasprice;
            if (fee > 0) {
                require(msg.value >= fee, "Not enough fee.");
                bank.suterAgency.transfer(fee);
                bank.totalTransferFee = bank.totalTransferFee + fee;
            }
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit TransferSuccess(y_tuples);
    }

    function validateNonce(bytes32[2] memory nonce) internal {
        bytes32 uHash = keccak256(abi.encode(nonce));
        for (uint256 i = 0; i < bank.nonceSet.length; i++) {
            require(bank.nonceSet[i] != uHash, "Nonce seen!");
        }
        bank.nonceSet.push(uHash);
    }
}


