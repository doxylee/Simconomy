import BigNumber, { BN } from "@core/common/BigNumber";

export type RetailMarketData = {
    itemId: string;
    dailyDemand: BigNumber;
    baseRetailPrice: BigNumber;
    localSupplier: {
        size: BigNumber;
        price: BigNumber;
    };
};

const RETAIL_MARKET_DATA_LIST: RetailMarketData[] = [
    {
        itemId: "goldRing",
        dailyDemand: BN(5000),
        baseRetailPrice: BN(300),
        localSupplier: {
            size: BN(5000),
            price: BN(500),
        },
    },
    {
        itemId: "watch",
        dailyDemand: BN(10000),
        baseRetailPrice: BN(30),
        localSupplier: {
            size: BN(10000),
            price: BN(50),
        },
    },
    {
        itemId: "electronicWatch",
        dailyDemand: BN(10000),
        baseRetailPrice: BN(20),
        localSupplier: {
            size: BN(10000),
            price: BN(40),
        },
    },
];

export const RETAIL_MARKET_DATA: Record<string, RetailMarketData> = Object.fromEntries(
    RETAIL_MARKET_DATA_LIST.map((data) => [data.itemId, data])
);