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
        uint256 totalVolume;
        uint256 totalUnlocked;

        LockItem[] lockItems;
    }

    struct LockItem {
        uint256 volume;
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

        return locker.totalVolume.sub(unlockedInTheoretical(account));
    }

    function balanceOfFree(address account) public view returns (uint256) {
        uint256 freeze = balanceOfFreeze(account);
        return balanceOf(account).sub(freeze);
    }

    function getLockerOverview(address account) public view returns (uint256 totalVolume, uint256 totalUnlocked) {
        Locker memory locker = _lockers[account];

        return (locker.totalVolume, locker.totalUnlocked);
    }

    function getLockerDetail(address account, uint256 index) public view returns (uint256 volume, uint256 timeUnlockFirst, uint256 ratio, uint256 interval) {
        LockItem memory lockItem = _lockers[account].lockItems[index];

        return (lockItem.volume, lockItem.timeUnlockFirst, lockItem.ratio, lockItem.interval);
    }

    function unlockedInTheoretical(address account) private view returns (uint256) {
        uint256 theoreticalValue = 0;

        LockItem[] memory lockItems = _lockers[account].lockItems;
        for (uint256 index = 0; index < lockItems.length; index ++) {
            uint256 timePoint = _timeMarket.add(lockItems[index].timeUnlockFirst);
            if (_timeMarket != 0 && block.timestamp > timePoint) {
                if (lockItems[index].volume > 0) {
                    uint256 unlockedRate = lockItems[index].ratioUnlockFirst;
                    uint256 pastTime = block.timestamp - timePoint; // just subtraction
                    unlockedRate = unlockedRate.add(lockItems[index].interval == 0 ? 1e18 : (pastTime / lockItems[index].interval).mul(lockItems[index].ratio));
                    unlockedRate = unlockedRate > 1e18 ? 1e18 : unlockedRate;

                    theoreticalValue = theoreticalValue.add(lockItems[index].volume.mul(unlockedRate).div(1e18));
                }
            }
        }

        return theoreticalValue;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        to; // currently unused

        if (from != address(this) && from != address(0)) {
            Locker memory locker = _lockers[from];
            uint256 lockedAmount = locker.totalVolume.sub(locker.totalUnlocked);
            if (_timeMarket != 0 && lockedAmount != 0) {
                uint256 theoreticalValue = unlockedInTheoretical(from);
                if (theoreticalValue > locker.totalUnlocked) {
                    require(theoreticalValue <= locker.totalVolume, "theoreticalValue overflow");

                    _lockers[from].totalUnlocked = theoreticalValue;
                    lockedAmount = locker.totalVolume.sub(theoreticalValue);
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

//          require(_lockers[to].volume == 0, "already distribution");

            _lockers[to].lockItems.push(LockItem({
                volume: amount,
                timeUnlockFirst: timeUnlockFirst,
                ratioUnlockFirst: ratioUnlockFirst,
                ratio: ratio,
                interval: interval
            }));
            _lockers[to].totalVolume = _lockers[to].totalVolume.add(amount);

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
