//SPDX-License-Identifier: Unlicense
pragma solidity =0.6.12;

import "./include/SafeMath.sol";
import "./include/ERC20.sol";
import "./include/Ownable.sol";

contract GMSToken is Ownable, ERC20 {
    using SafeMath for uint256;

    uint256 private _timeMarket;
    mapping (address => Locker) private _lockers;

    // struct
    struct Locker {
        uint256 volume;
        uint256 unlocked;
        uint256 timeUnlockFirst;    // since _timeMarket
        uint256 ratioUnlockFirst;
        uint256 ratio;
        uint256 interval;
    }

    constructor() public ERC20("GMS Token", "GMS") {
        _mint(address(this), 10000000000 * 1e18);
    }

    function setTimeMarket(uint256 timeMarket) public onlyOwner {
        _timeMarket = timeMarket;
    }

    function getTimeMarket() public view returns (uint256) {
        return _timeMarket;
    }

    function balanceOfFreeze(address account) public view returns (uint256) {
        Locker memory locker = _lockers[account];
        return locker.volume.sub(locker.unlocked).sub(balanceOfUnlockable(account));
    }

    function balanceOfFree(address account) public view returns (uint256) {
        uint256 freeze = balanceOfFreeze(account);
        return balanceOf(account).sub(freeze);
    }

    function getLocker(address account) public view returns (uint256 volume, uint256 unlocked, uint256 timeUnlockFirst, uint256 ratio, uint256 interval) {
        Locker memory locker = _lockers[account];

        return (locker.volume, locker.unlocked, locker.timeUnlockFirst, locker.ratio, locker.interval);
    }

    function balanceOfUnlockable(address account) private view returns (uint256) {
        uint256 unlockableAmount = 0;

        Locker memory locker = _lockers[account];
        uint256 timePoint = _timeMarket.add(locker.timeUnlockFirst);
        if (_timeMarket != 0 && block.timestamp > timePoint) {
            if (locker.volume > locker.unlocked) {
                uint256 unlockedRate = locker.ratioUnlockFirst;
                uint256 pastTime = block.timestamp - timePoint; // just subtraction
                unlockedRate = unlockedRate.add(locker.interval == 0 ? 1e18 : (pastTime / locker.interval).mul(locker.ratio));
                unlockedRate = unlockedRate > 1e18 ? 1e18 : unlockedRate;

                unlockableAmount = locker.volume.mul(unlockedRate).div(1e18) - locker.unlocked; // just subtraction
            }
        }

        return unlockableAmount;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        to; // currently unused

        if (from != address(this) && from != address(0)) {
            Locker memory locker = _lockers[from];
            uint256 lockedAmount = locker.volume.sub(locker.unlocked);
            uint256 timePoint = _timeMarket.add(locker.timeUnlockFirst);
            if (_timeMarket != 0 && block.timestamp > timePoint) {
                uint256 unlockableAmount = balanceOfUnlockable(from);
                if (unlockableAmount > 0) {
                    uint256 unlocked = locker.unlocked.add(unlockableAmount);
                    require(unlocked <= locker.volume, "balance overflow");

                    _lockers[from].unlocked = unlocked;
                    lockedAmount = locker.volume.sub(unlocked);
                }
            }
            uint256 availableBalance = balanceOf(from).sub(lockedAmount);
            require(availableBalance >= amount, "ERC20: transfer amount exceeds balance");
        }
    }

    function distribution(address[] memory tos, uint256[] memory amounts, uint256 timeUnlockFirst, uint256 ratioUnlockFirst, uint256 ratio, uint256 interval) public onlyOwner {
        uint256 length = tos.length;
        require(length == amounts.length, "length mismatch");

        for (uint256 index = 0; index < length; index ++) {
            address to = tos[index];
            uint256 amount = amounts[index];

            require(_lockers[to].volume == 0, "already distribution");

            _lockers[to] = Locker({
                volume: amount,
                unlocked: 0,
                timeUnlockFirst: timeUnlockFirst,
                ratioUnlockFirst: ratioUnlockFirst,
                ratio: ratio,
                interval: interval
            });
            _transfer(address(this), to, amount);
        }
    }

    function distributionUnLock(address[] memory tos, uint256[] memory amounts) public onlyOwner {
        uint256 length = tos.length;
        require(length == amounts.length, "length mismatch");

        for (uint256 index = 0; index < length; index ++)
            _transfer(address(this), tos[index], amounts[index]);
    }

    function distributionUnLock1(address[] memory tos, uint256 amount) public onlyOwner {
        for (uint256 index = 0; index < tos.length; index ++)
            _transfer(address(this), tos[index], amount);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(address(this), amount);
    }

}
