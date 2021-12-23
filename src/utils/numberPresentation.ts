import BigNumber from "@core/common/BigNumber";

const nLookup = [
    { e: 12, s: "T" },
    { e: 9, s: "B" },
    { e: 6, s: "M" },
    { e: 3, s: "k" },
    { e: 0, s: "" },
];

// TODO: Also support numbers
// TODO: Better representation
//  min/max digits? So that insignificant 0s doesn't show
export function nFormat(num: BigNumber, options: { d?: number } = {}) {
    const { d = 3 } = options;

    if (num.e === null) return num.s === 1 ? "Inf" : "-Inf";

    const found = nLookup.find(({ e }) => (num.e ?? 0) >= e);
    if (found) {
        const abovePoint = num.e - found.e;
        const shifted = num.shiftedBy(-found.e);
        return shifted.toPrecision(Math.max(d, abovePoint + 1)) + found.s;
    } else return num.toPrecision(d);
}

// TODO: Also support numbers
export function toPercent(num: BigNumber, options: { dp?: number } = {}) {
    const { dp = 0 } = options;
    return num.times(100).toFixed(dp) + "%";
}
