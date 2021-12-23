import { describe, expect, it } from "@jest/globals";
import { BN } from "@core/common/BigNumber";
import { nFormat } from "@src/utils/numberPresentation";

describe("numberPresentation", () => {
    describe("nFormat", () => {
        it.each([
            { num: BN(1), d: undefined, expected: "1.00" },
            { num: BN(1e3), d: undefined, expected: "1.00k" },
            { num: BN(1e6), d: undefined, expected: "1.00M" },
            { num: BN(1e9), d: undefined, expected: "1.00B" },
            { num: BN(1e12), d: undefined, expected: "1.00T" },
            { num: BN(123456789), d: 5, expected: "123.46M" },
            { num: BN(123456789), d: 1, expected: "123M" },
            { num: BN(123), d: 2, expected: "123" },
        ])("formats $expected", ({ num, d, expected }) => {
            expect(nFormat(num, { d })).toBe(expected);
        });
    });
});
