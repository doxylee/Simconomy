import { Entity, EntityConstructionParam } from "@core/common/entity";
import { BigNumber } from "@core/common/BigNumber";
import { FirmType } from "@core/common/FirmType";
import { SupplyEntry } from "@core/packages/wholesale_market/SupplyEntry";

export type WholesaleContractStatus = "active" | "terminated";

const DEFAULT_PRICE_INCREASE_LIMIT_RATIO = 0.1;

type RequiredConstructorParams = "buyerCompanyId" | "buyerFirmType" | "buyerFirmId" | "amount";

export class WholesaleContract extends Entity {
    entityType: "WholesaleContract" = "WholesaleContract";
    supplyEntryId: string;
    supplyCompanyId: string;
    supplyFirmType: FirmType;
    supplyFirmId: string;
    productId: string;

    buyerCompanyId: string;
    buyerFirmType: FirmType;
    buyerFirmId: string;
    // TODO: buyerItemGroupId?: string;
    amount: BigNumber;
    // TODO: maxAmount: BigNumber;
    startPrice: BigNumber;
    priceIncreaseLimit: BigNumber;
    status: WholesaleContractStatus;

    // noinspection DuplicatedCode
    constructor({
        supplyEntryId,
        supplyCompanyId,
        supplyFirmType,
        supplyFirmId,
        productId,
        buyerCompanyId,
        buyerFirmType,
        buyerFirmId,
        amount,
        startPrice,
        priceIncreaseLimit,
        status,
        ...data
    }: Omit<WholesaleContract, keyof Entity> & EntityConstructionParam) {
        super(data);

        // TODO: Make constructor lines fewer. Object.assign() perhaps?
        this.supplyEntryId = supplyEntryId;
        this.supplyCompanyId = supplyCompanyId;
        this.supplyFirmType = supplyFirmType;
        this.supplyFirmId = supplyFirmId;
        this.productId = productId;
        this.buyerCompanyId = buyerCompanyId;
        this.buyerFirmType = buyerFirmType;
        this.buyerFirmId = buyerFirmId;
        this.amount = amount;
        this.startPrice = startPrice;
        this.priceIncreaseLimit = priceIncreaseLimit;
        this.status = status;
    }

    /**
     * Create new WholesaleContract with defaults.
     *
     * @param supplyEntry
     * @param buyerCompanyId
     * @param buyerFirmType
     * @param buyerFirmId
     * @param priceIncreaseLimit
     * @param amount
     */
    static createWithSupplyEntry({
        supplyEntry,
        buyerCompanyId,
        buyerFirmType,
        buyerFirmId,
        priceIncreaseLimit = supplyEntry.price.times(DEFAULT_PRICE_INCREASE_LIMIT_RATIO),
        amount,
    }: { supplyEntry: SupplyEntry; priceIncreaseLimit?: BigNumber } & Pick<
        WholesaleContract,
        "buyerCompanyId" | "buyerFirmType" | "buyerFirmId" | "amount"
    >) {
        return new WholesaleContract({
            supplyEntryId: supplyEntry.id,
            supplyCompanyId: supplyEntry.companyId,
            supplyFirmType: supplyEntry.firmType,
            supplyFirmId: supplyEntry.firmId,
            productId: supplyEntry.productId,
            buyerCompanyId,
            buyerFirmType,
            buyerFirmId,
            amount,
            startPrice: supplyEntry.price,
            priceIncreaseLimit,
            status: "active",
        });
    }
}
