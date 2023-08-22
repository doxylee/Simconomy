import { useCore } from "@src/utils/useCore";
import TitleCard from "@src/components/specific/factories/detail/TitleCard";
import ManufactureCard from "@src/components/specific/factories/detail/ManufactureCard/ManufactureCard";
import SupplyCard from "@src/components/specific/factories/detail/SupplyCard/SupplyCard";
import StorageCard from "@src/components/specific/factories/detail/StorageCard";
import WholesaleCard from "@src/components/specific/factories/detail/WholesaleCard";
import { useQuery } from "@src/utils/useQuery";
import { useRouter } from "next/router";
import { getFirstParam } from "@src/utils/queryHelpers";

export default function MainPage() {
    const router = useRouter();
    const core = useCore();
    const factoryId = getFirstParam(router.query.id)
    const factoryQuery = useQuery(core?.factoryService.getFactory, factoryId as string, {enabled:factoryId})
    if(!factoryQuery.data)return null;

    return (
        <main className="grow flex flex-col justify-items-stretch items-stretch space-y-4 w-full p-16 bg-amber-50">
            <div className="flex flex-row grow space-x-4">
                <TitleCard />
                <ManufactureCard factory={factoryQuery.data}/>
            </div>
            <div className="flex flex-row grow space-x-4">
                <SupplyCard factoryId={factoryId} />
                <StorageCard />
                <WholesaleCard />
            </div>
        </main>
    );
}
