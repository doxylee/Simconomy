import { Card } from "@mui/material";
import { useCore } from "@src/utils/useCore";
import { WholesaleContract } from "@core/packages/wholesale_market/WholesaleContract";
import { useQuery } from "@src/utils/useQuery";
import { VerticalBarIndicator } from "@src/components/common/VerticalBarIndicator";

type Props = {
    factoryId: string;
};

export default function SupplyCard({ factoryId }: Props) {
    const core = useCore();
    const contractQuery = useQuery(core?.wholesaleMarketService.getBuyContractsOfFirm, factoryId, { enabled: factoryId });
    if (!core) return null;

    const contracts = contractQuery.data;

    return (
        <Card className="flex items-center justify-center grow">
            <div className="w-full h-full p-4">
                {contracts?.map((contract) => (
                    <SupplyListItem contract={contract}/>
                ))}
            </div>
        </Card>
    );
}

type SupplyListItemProps = {
    contract: WholesaleContract;
};

function SupplyListItem({ contract }: SupplyListItemProps) {
    return (
        <div className="flex flex-col">
            <div>{contract.productId}</div>
            <div className="flex">
                <div className="bg-gray-300 w-16 h-16"/>
            </div>
        </div>
    );
}
