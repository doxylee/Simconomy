import { TurnProgressSystem } from "@core/systems/TurnProgressSystem";
import { CompanyService } from "@core/packages/company/CompanyService";
import { SellingDataForCustomerMarket, ShopService } from "@core/packages/shop/ShopService";
import groupBy from "lodash/groupBy";
import { RETAIL_MARKET_DATA, RetailMarketData } from "@core/packages/retail_market/RetailMarketConstData";
import { BN } from "@core/common/BigNumber";
import { BigNumber } from "bignumber.js";
import { Service } from "@src/core/common/Service";

// TODO: better name
type ProcessedSellingData = {
    shopId: string;
    supplyPoint: BigNumber;
    itemGroupId: string;
    amount: BigNumber;
    price: BigNumber;
    amountPerSupplyPoint: BigNumber;
};

export class RetailMarketService extends Service {
    userIdentity = {};

    turnProgressSystem!: TurnProgressSystem;
    companyService!: CompanyService;
    shopService!: ShopService;

    constructor({ userIdentity }: { userIdentity: {} }) {
        super();
        this.userIdentity = userIdentity;
        this.bindMethods();
    }

    initialize({
        turnProgressSystem,
        companyService,
        shopService,
    }: {
        turnProgressSystem: TurnProgressSystem;
        companyService: CompanyService;
        shopService: ShopService;
    }) {
        this.turnProgressSystem = turnProgressSystem;
        this.companyService = companyService;
        this.shopService = shopService;

        turnProgressSystem.registerCallback("retailSaleStep", this.progressTurn.bind(this));
    }

    /**
     * Fetch all shops and get their SaleEntries & ItemGroups.
     * Group by product type, and calculate how much will be sold by each shop.
     * Perform sales as calculated.
     */
    async progressTurn() {
        const sellingDataOfAllProducts = await this.shopService.getSellingDataForCustomerMarket();
        const sellingDataOfShopsByProductType = groupBy(sellingDataOfAllProducts, (sellingData) => sellingData.itemId);
        for (const [itemId, sellingDataOfShops] of Object.entries(sellingDataOfShopsByProductType))
            await this.progressTurnForItemType(RETAIL_MARKET_DATA[itemId], sellingDataOfShops);
    }

    private async progressTurnForItemType(retailMarketData: RetailMarketData, sellingDataOfShops: SellingDataForCustomerMarket[]) {
        const { baseRetailPrice, dailyDemand, localSupplier } = retailMarketData;

        const { shopSupplyPoints, processedSellingDataOfShops } = this.calculateSupplyPointsOfShops(sellingDataOfShops, retailMarketData);
        const localSupplierSupplyPoints = this.getSupplyPointsOfLocalSupplier(localSupplier, baseRetailPrice);

        await this.performDistributedSales(shopSupplyPoints.plus(localSupplierSupplyPoints), dailyDemand, processedSellingDataOfShops);
    }

    private calculateSupplyPointsOfShops(sellingDataOfShops: SellingDataForCustomerMarket[], { baseRetailPrice }: RetailMarketData) {
        let shopSupplyPoints = BN(0);
        const processedSellingDataOfShops: ProcessedSellingData[] = [];
        for (const { price, size, shopId, itemGroup } of sellingDataOfShops) {
            const overallRating = this.getOverallRatingOfSellingData({ price, baseRetailPrice });
            if (overallRating.lte(0)) continue;
            const supplyPoint = size.times(overallRating.times(overallRating));
            shopSupplyPoints = shopSupplyPoints.plus(supplyPoint);
            processedSellingDataOfShops.push({
                shopId,
                supplyPoint,
                itemGroupId: itemGroup.groupId,
                amount: itemGroup.amount,
                price,
                amountPerSupplyPoint: itemGroup.amount.div(supplyPoint),
            });
        }
        return { shopSupplyPoints, processedSellingDataOfShops };
    }

    private getSupplyPointsOfLocalSupplier(localSupplier: { size: BigNumber; price: BigNumber }, baseRetailPrice: BigNumber) {
        const localSupplierOverallRating = this.getOverallRatingOfSellingData({ price: localSupplier.price, baseRetailPrice });
        if (localSupplierOverallRating.isPositive())
            return localSupplier.size.times(localSupplierOverallRating.times(localSupplierOverallRating));
        else return BN(0);
    }

    private getOverallRatingOfSellingData({ price, baseRetailPrice }: { price: BigNumber; baseRetailPrice: BigNumber }) {
        // TODO: optimization? BigNumber really needed here?
        return BN(50).plus(BN(40).times(BN(1).minus(price.div(baseRetailPrice)))); // 50 + 40 * (1 - (price / baseRetailPrice))
    }

    private async performDistributedSales(
        totalSupplyPoints: BigNumber,
        remainingDemand: BigNumber,
        processedSellingDataOfShops: ProcessedSellingData[]
    ) {
        // sort that shop with lower stock comes first
        processedSellingDataOfShops.sort((a, b) => a.amountPerSupplyPoint.comparedTo(b.amountPerSupplyPoint));

        for (const { shopId, supplyPoint, itemGroupId, amount, price } of processedSellingDataOfShops) {
            const demandForThisShop = remainingDemand.times(supplyPoint).dividedToIntegerBy(totalSupplyPoints);
            const salesVolume = BigNumber.min(demandForThisShop, amount);
            // TODO: optimization opportunity
            await this.shopService.sellItem({ shopId, itemGroupId, amount: salesVolume, totalPrice: price.times(salesVolume) });
            totalSupplyPoints = totalSupplyPoints.minus(supplyPoint);
            remainingDemand = remainingDemand.minus(salesVolume);
        }
    }
}
