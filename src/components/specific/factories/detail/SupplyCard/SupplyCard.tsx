import { Card, IconButton } from "@mui/material";
import { useCore } from "@src/utils/useCore";
import { WholesaleContract } from "@core/packages/wholesale_market/WholesaleContract";
import { useQuery } from "@src/utils/useQuery";
import Close from "@mui/icons-material/Close";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";

type Props = {
    factoryId: string;
};

export default function SupplyCard({ factoryId }: Props) {
    const core = useCore();
    const contractQuery = useQuery(core?.wholesaleMarketService.getBuyContractsOfFirm, factoryId, { enabled: factoryId });
    if (!core) return null;

    const contracts = contractQuery.data;

    return (
        <Card className="flex flex-col grow p-4">
            <h2 className="text-xl mb-2">Suppliers</h2>
            <div className="w-full h-full">
                {contracts?.map((contract) => (
                    <SupplyListItem contract={contract} />
                ))}
            </div>
        </Card>
    );
}

type SupplyListItemProps = {
    contract: WholesaleContract;
};

function SupplyListItem({ contract }: SupplyListItemProps) {
    const core = useCore();
    const supplyEntryQuery = useQuery(core?.wholesaleMarketService.getSupplyEntry, contract.supplyEntryId);
    return (
        <div className="flex flex-col hover:bg-gray-100">
            <div className="flex justify-between">
                <span>{contract.productId}</span>
                <IconButton size="small">
                    <Close className="text-xl" />
                </IconButton>
            </div>
            <div className="flex space-x-2">
                <div className="bg-gray-300 w-16 h-16" />
                <div className="flex flex-col">
                    <div className="text-sm">Cost: ${contract.startPrice.toFixed()}</div>
                    {/* TODO: Should show actual price, not start price */}
                    <div className="text-sm">Stock: {supplyEntryQuery.data?.stockAmount.toString()}</div>
                    <div className="text-sm">
                        <span>Amount: {contract.amount.toString()} </span>
                        <IconButton size="small">
                            <Add className="text-lg" />
                        </IconButton>
                        <IconButton size="small">
                            <Remove className="text-lg" />
                        </IconButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
