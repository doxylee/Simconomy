import { Entity, EntityConstructionParam } from "@core/common/entity";
import { ItemGroup } from "@core/packages/item/ItemGroup";

export class LocalSupplier extends Entity {
    entityType: "LocalSupplier" = "LocalSupplier";
    companyId: string;
    itemId: string;
    sellingItemTemplate: ItemGroup;

    constructor({
        companyId,
        sellingItemTemplate,
        ...data
    }: Pick<LocalSupplier, "companyId" | "sellingItemTemplate"> & EntityConstructionParam) {
        super(data);
        this.companyId = companyId;
        this.itemId = sellingItemTemplate.def.id;
        this.sellingItemTemplate = sellingItemTemplate;
    }
}
