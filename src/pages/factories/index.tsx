import { Button } from "@mui/material";
import CommonHeader from "@src/components/common/CommonHeader";
import FactoryListItem from "@src/components/specific/factories/FactoryListItem";
import { BN } from "@core/common/BigNumber";
import { useCore } from "@src/utils/useCore";
import { ItemStorage } from "@core/packages/item/ItemStorage";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { Factory } from "@core/packages/factory/Factory";

export default function MainPage() {
    const core = useCore();
    if (!core) return null;

    return (
        <main className="flex flex-col items-stretch space-y-4  w-full p-16 min-h-screen">
            <CommonHeader />

            <div id="factories_filter" className="p-6 border border-gray-400 text-center">
                filter
            </div>

            <div id="factories_list" className="flex flex-col items-stretch space-y-2">
                <Button variant="contained" className="text-white bg-green-400 hover:bg-green-500 text-base">
                    + Create
                </Button>
            </div>

            <FactoryListItem
                factory={
                    new Factory({
                        size: BN(4),
                        companyId: "",
                        process: core.factoryProcessLibrary.getAllFactoryProcesses()[0],
                        storage: new ItemStorage({
                            maxVolume: BN(100),
                            items: [
                                new ItemGroup({ def: core.itemLibrary.getItemDef("steel"), amount: BN(100000) }),
                                new ItemGroup({ def: core.itemLibrary.getItemDef("ironOre"), amount: BN(100000) }),
                            ],
                        }),
                    })
                }
            />
        </main>
    );
}
