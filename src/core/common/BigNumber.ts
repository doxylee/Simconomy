// Wrapped to add methods, or change to other library if needed.

import BigNumber from "bignumber.js";

export { BigNumber };
export default BigNumber;

export function BN(n: number | string | BigNumber.Instance) {
    return new BigNumber(n);
}
