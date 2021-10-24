import {Entity, EntityConstructionParam} from "@core/common/entity";
import BigNumber, {BN} from "@core/common/BigNumber";
import {ItemStorage} from "@core/packages/item/ItemStorage";
import {FactoryProcess} from "@core/packages/factory/FactoryProcess";
import {ItemGroup} from "@core/packages/item/ItemGroup";

export class Factory extends Entity {
    entityType: "Factory" = "Factory";
    companyId: string;
    size: BigNumber;
    storage: ItemStorage;
    process: FactoryProcess | null;
    
    constructor({
                    companyId,
                    size,
                    storage,
                    process = null,
                    ...data
                }: Pick<Factory, "companyId" | "size" | "storage"> & Partial<Pick<Factory, "process">> & EntityConstructionParam) {
        super(data);
        this.companyId = companyId;
        this.size = size;
        this.storage = storage;
        this.process = process;
    }
    
    
}