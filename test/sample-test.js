/*global artifacts, web3, contract, before, it, context*/
/*eslint no-undef: "error"*/

const { expect, assert } = require('chai');
const { constants, time, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const GMSToken = artifacts.require('GMSToken');

const { toWei } = web3.utils;

contract('GMSToken', (accounts) => {

    let gms;
    let amount = 20000;

    context('>> Seed', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();
            await gms.setTimeMarket(await time.latest());

            await gms.distribution([accounts[1]], [toWei(`${amount}`)], 30*24*60*60, toWei("0.125"), 30*24*60*60);
        });
        it('should transfer immediately', async () => {
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 30 days later', async () => {
            await time.increase(time.duration.days(30));
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 60 days later', async () => {
            await time.increase(time.duration.days(30));
            let amt = amount * 0.125;
            await expectRevert(
                gms.transfer(accounts[2], toWei(`${amt + 1}`), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );

            let tx = await gms.transfer(accounts[2], toWei(`${amt}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amt}`)
                }
            );
            expect(toWei(`${amt}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
        });

        it('should transfer 270 days later', async () => {
            await time.increase(time.duration.days(210));
            let amt = amount - amount * 0.125;
            await expectRevert(
                gms.transfer(accounts[2], toWei(`${amt + 1}`), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );

            let tx = await gms.transfer(accounts[2], toWei(`${amt}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amt}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
        });
    });

    context('>> Private A', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();
            await gms.setTimeMarket(await time.latest());

            await gms.distribution([accounts[1]], [toWei(`${amount}`)], 14*24*60*60, toWei("0.15"), 30*24*60*60);
        });
        it('should transfer immediately', async () => {
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 14 days later', async () => {
            await time.increase(time.duration.days(14));
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 44 days later', async () => {
            await time.increase(time.duration.days(30));
            let amt = amount * 0.15;
            await expectRevert(
                gms.transfer(accounts[2], toWei(`${amt + 1}`), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );

            let tx = await gms.transfer(accounts[2], toWei(`${amt}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amt}`)
                }
            );
            expect(toWei(`${amt}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
        });

        it('should transfer 224 days later', async () => {
            await time.increase(time.duration.days(180));
            let amt = amount - amount * 0.15;
            await expectRevert(
                gms.transfer(accounts[2], toWei(`${amt + 1}`), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );

            let tx = await gms.transfer(accounts[2], toWei(`${amt}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amt}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
        });
    });

    context('>> Private B', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();
            await gms.setTimeMarket(await time.latest());

            await gms.distribution([accounts[1]], [toWei(`${amount}`)], 7*24*60*60, toWei("0.167"), 30*24*60*60);
        });
        it('should transfer immediately', async () => {
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 7 days later', async () => {
            await time.increase(time.duration.days(7));
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 37 days later', async () => {
            await time.increase(time.duration.days(30));
            let amt = amount * 0.167;
            await expectRevert(
                gms.transfer(accounts[2], toWei(`${amt + 1}`), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );

            let tx = await gms.transfer(accounts[2], toWei(`${amt}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amt}`)
                }
            );
            expect(toWei(`${amt}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
        });

        it('should transfer 187 days later', async () => {
            await time.increase(time.duration.days(150));
            let amt = amount - amount * 0.167;
            await expectRevert(
                gms.transfer(accounts[2], toWei(`${amt + 1}`), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );

            let tx = await gms.transfer(accounts[2], toWei(`${amt}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amt}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
        });
    });

    context('>> IDO', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();

            await gms.distribution([accounts[1]], [toWei(`${amount}`)], 0, toWei("1"), 0);
        });

        it('should transfer immediately', async () => {
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer after setTimeMarket', async () => {
            await gms.setTimeMarket(await time.latest());
            await time.increase(time.duration.seconds(1));
            let tx = await gms.transfer(accounts[2], toWei(`${amount}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amount}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });
    });

    context('>> Team incentive', () => {
        // see Marketing & Operations
        // accounts[2]
    });

    context('>> Marketing & Operations', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();
            await gms.setTimeMarket(await time.latest());

            await gms.distribution([accounts[1]], [toWei(`${amount}`)], 0, toWei("0.125"), 30*24*60*60);
            await gms.distribution([accounts[2]], [toWei(`${amount}`)], 9*30*24*60*60, toWei("0.125"), 30*24*60*60);
        });

        it('should transfer immediately', async () => {
            await expectRevert(
                gms.transfer(accounts[3], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
            await expectRevert(
                gms.transfer(accounts[3], toWei("1"), {from: accounts[2]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 9 * 30 days later', async () => {
            await time.increase(time.duration.days(9*30));
            let tx = await gms.transfer(accounts[3], toWei(`${amount}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[3],
                    value: toWei(`${amount}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[3])).toString());
            await expectRevert(
                gms.transfer(accounts[3], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
            await expectRevert(
                gms.transfer(accounts[3], toWei("1"), {from: accounts[2]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 17 * 30 days later', async () => {
            await time.increase(time.duration.days(8*30));
            let tx = await gms.transfer(accounts[3], toWei(`${amount}`), {from: accounts[2]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[2],
                    to: accounts[3],
                    value: toWei(`${amount}`)
                }
            );
            expect(toWei(`${2*amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[3])).toString());
            await expectRevert(
                gms.transfer(accounts[3], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
            await expectRevert(
                gms.transfer(accounts[3], toWei("1"), {from: accounts[2]}),
                'ERC20: transfer amount exceeds balance'
            );
        });
    });

    context('>> Liquidity (unlock)', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();
            await gms.setTimeMarket(await time.latest());

            await gms.distributionUnLock1([accounts[1]], toWei(`${amount}`));
        });

        it('should transfer immediately', async () => {
            let tx = await gms.transfer(accounts[2], toWei(`${amount}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amount}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });
    });

    context('>> DAO', () => {
        before('!! deploy / distribution', async () => {
            gms = await GMSToken.new();
            await gms.setTimeMarket(await time.latest());

            await gms.distribution([accounts[1]], [toWei(`${amount}`)], 0, toWei("1"), 24*30*24*60*60);
        });

        it('should transfer immediately', async () => {
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 500 days later', async () => {
            await time.increase(time.duration.days(719));
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });

        it('should transfer 720 days later', async () => {
            await time.increase(time.duration.days(1));
            let tx = await gms.transfer(accounts[2], toWei(`${amount}`), {from: accounts[1]});
            await expectEvent.inTransaction(
                tx.tx,
                gms,
                'Transfer',
                {
                    from: accounts[1],
                    to: accounts[2],
                    value: toWei(`${amount}`)
                }
            );
            expect(toWei(`${amount}`)).to.equal(BigInt(await gms.balanceOf(accounts[2])).toString());
            await expectRevert(
                gms.transfer(accounts[2], toWei("1"), {from: accounts[1]}),
                'ERC20: transfer amount exceeds balance'
            );
        });
    });

});