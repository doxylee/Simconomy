import { Factory } from "@core/packages/factory/Factory";
import { BN } from "@core/common/BigNumber";
import { ItemStorage } from "@core/packages/item/ItemStorage";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { ItemLibrary } from "@core/packages/item/ItemLibrary";
import { FactoryProcessLibrary } from "@core/packages/factory/FactoryProcessLibrary";
import { dummyCompany1 } from "@src/dummy/dummyCompany1";

const dummyFactoryProcessLib = new FactoryProcessLibrary();
const dummyItemLib = new ItemLibrary();

export const dummyFactory2 = new Factory({
    size: BN(4),
    companyId: dummyCompany1.id,
    process: dummyFactoryProcessLib.getAllFactoryProcesses()[0],
    storage: new ItemStorage({
        maxVolume: BN(100),
        items: [
            new ItemGroup({ def: dummyItemLib.getItemDef("steel"), amount: BN(100000) }),
            new ItemGroup({ def: dummyItemLib.getItemDef("ironOre"), amount: BN(100000) }),
        ],
    }),
});
