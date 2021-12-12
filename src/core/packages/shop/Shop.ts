import { Entity, EntityConstructionParam } from "@core/common/entity";
import { BigNumber } from "@core/common/BigNumber";
import { ItemStorage } from "@core/packages/item/ItemStorage";
import { SaleEntry } from "@core/packages/shop/SaleEntry";

export class Shop extends Entity {
    entityType: "Shop" = "Shop";
    companyId: string;
    size: BigNumber;
    // TODO: popularity: BigNumber;
    // TODO: traffic: BigNumber;
    storage: ItemStorage;
    selling: SaleEntry[];

    constructor({
        companyId,
        size,
        storage,
        selling = [],
        ...data
    }: Pick<Shop, "companyId" | "size" | "storage"> & Partial<Pick<Shop, "selling">> & EntityConstructionParam) {
        super(data);
        this.companyId = companyId;
        this.size = size;
        this.storage = storage;
        this.selling = selling;
    }
}
