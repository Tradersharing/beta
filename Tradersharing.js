// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
    function decimals() external view returns (uint8);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint) external;
    function transfer(address to, uint value) external returns (bool);
}

interface IFreeSwapFactory {
    function getPair(address tokenA, address tokenB) external view returns (address);
}

interface IFreeSwapPair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112, uint112, uint32);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

contract TraderSharingSwapRouter {
    address public immutable factory;
    address public immutable WETH;

    constructor(address _factory, address _weth) {
        factory = _factory;
        WETH = _weth;
    }

    receive() external payable {
        require(msg.sender == WETH, "Only WETH allowed");
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        require(block.timestamp <= deadline, "Expired");

        IERC20(path[0]).transferFrom(msg.sender, _getPair(path[0], path[1]), amountIn);
        amounts = _swap(amountIn, path, to);

        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");
    }

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts) {
        require(path[0] == WETH, "Path must start with WETH");
        require(block.timestamp <= deadline, "Expired");

        IWETH(WETH).deposit{value: msg.value}();
        assert(IWETH(WETH).transfer(_getPair(path[0], path[1]), msg.value));

        amounts = _swap(msg.value, path, to);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");
    }

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(path[path.length - 1] == WETH, "Path must end with WETH");
        require(block.timestamp <= deadline, "Expired");

        IERC20(path[0]).transferFrom(msg.sender, _getPair(path[0], path[1]), amountIn);
        amounts = _swap(amountIn, path, address(this));
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");

        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        payable(to).transfer(amounts[amounts.length - 1]);
    }

    function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts) {
        require(path.length >= 2, "Invalid path");

        amounts = new uint[](path.length);
        amounts[0] = amountIn;

        for (uint i = 0; i < path.length - 1; i++) {
            (uint reserveIn, uint reserveOut) = getReserves(path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    function _swap(uint amountIn, address[] memory path, address _to) internal returns (uint[] memory amounts) {
        amounts = new uint[](path.length);
        amounts[0] = amountIn;

        for (uint i = 0; i < path.length - 1; i++) {
            address input = path[i];
            address output = path[i + 1];
            address pair = _getPair(input, output);
            (address token0, ) = sortTokens(input, output);

            (uint reserveIn, uint reserveOut) = getReserves(input, output);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);

            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));

            address to = _getToAddress(path, i, _to);
            IFreeSwapPair(pair).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    function _getToAddress(address[] memory path, uint i, address _to) internal view returns (address) {
        if (i < path.length - 2) {
            return _getPair(path[i + 1], path[i + 2]);
        } else {
            return _to;
        }
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint) {
        require(amountIn > 0, "Insufficient input");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");

        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }

    function getReserves(address tokenA, address tokenB) public view returns (uint reserveA, uint reserveB) {
        address pair = _getPair(tokenA, tokenB);
        (address token0,) = sortTokens(tokenA, tokenB);
        (uint reserve0, uint reserve1,) = IFreeSwapPair(pair).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function sortTokens(address tokenA, address tokenB) internal pure returns (address, address) {
        require(tokenA != tokenB, "Identical addresses");
        return tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function _getPair(address tokenA, address tokenB) internal view returns (address) {
        return IFreeSwapFactory(factory).getPair(tokenA, tokenB);
    }
}
