const TransferProver = require('../prover/transfer.js');
const BurnProver = require('../prover/burn.js');

class Service {
    constructor() {
        var transfer = new TransferProver();
        var burn = new BurnProver();

        this.proveTransfer = (CLn, CRn, C, D, y, epoch, sk, r, bTransfer, bDiff, index) => {
            var statement = {};
            statement['CLn'] = CLn;
            statement['CRn'] = CRn;
            statement['C'] = C;
            statement['D'] = D;
            statement['y'] = y;
            statement['epoch'] = epoch;

            var witness = {};
            witness['sk'] = sk;
            witness['r'] = r;
            witness['bTransfer'] = bTransfer;
            witness['bDiff'] = bDiff;
            witness['index'] = index;

            return transfer.generateProof(statement, witness).serialize();
        }

        this.proveBurn = (CLn, CRn, y, epoch, sk, bDiff) => {
            var statement = {};
            statement['CLn'] = CLn;
            statement['CRn'] = CRn;
            statement['y'] = y;
            statement['epoch'] = epoch;

            var witness = {};
            witness['sk'] = sk;
            witness['bDiff'] = bDiff;

            return burn.generateProof(statement, witness).serialize();
        }
    }
}

module.exports = Service;
