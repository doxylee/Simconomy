import { DataObject } from "@core/common/dataobject";
import { BigNumber } from "@core/common/BigNumber";

export class SaleEntry extends DataObject {
    itemId: string;
    itemGroupId: string;
    price: BigNumber;

    constructor({ itemId, itemGroupId, price }: SaleEntry) {
        super();
        this.itemId = itemId;
        this.itemGroupId = itemGroupId;
        this.price = price;
    }
}