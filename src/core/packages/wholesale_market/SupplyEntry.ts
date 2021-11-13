import { Entity, EntityConstructionParam } from "@core/common/entity";
import { BigNumber } from "@core/common/BigNumber";
import { FirmType } from "@core/common/FirmType";

export type SupplyEntryStatus = "public" | "private" | "closed";

export class SupplyEntry extends Entity {
    entityType: "SupplyEntry" = "SupplyEntry";
    companyId: string;
    firmType: FirmType;
    firmId: string;
    productId: string;
    itemGroupId: string;
    stockAmount: BigNumber;
    price: BigNumber;
    // nextPrice: BigNumber; // Was planned for deferring price change to next turn for buyer protection
    status: SupplyEntryStatus;

    constructor({
        companyId,
        firmType,
        firmId,
        productId,
        itemGroupId,
        stockAmount,
        price,
        status,
        ...data
    }: Pick<SupplyEntry, "companyId" | "firmType" | "firmId" | "productId" | "itemGroupId" | "stockAmount" | "price" | "status"> &
        EntityConstructionParam) {
        super(data);
        this.companyId = companyId;
        this.firmType = firmType;
        this.firmId = firmId;
        this.productId = productId;
        this.itemGroupId = itemGroupId;
        this.stockAmount = stockAmount;
        this.price = price;
        this.status = status;
    }
}