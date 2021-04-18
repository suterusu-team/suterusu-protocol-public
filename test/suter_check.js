const CheckSuter = artifacts.require('CheckSuter');

contract("CheckSuter", async (accounts) => {
    let alice;
    let bob;

    it("should test ECC successfully", async () => {
        let suter = (await CheckSuter.deployed()).contract;

        var test = await suter.methods.test().call();

        assert.equal(
            test,
            true 
        );

    });
});
