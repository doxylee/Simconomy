import { FactoryProcess, ItemBatch } from "@core/packages/factory/FactoryProcess";
import { useCore } from "@src/utils/useCore";
import East from "@mui/icons-material/East";
import { ItemDefinition } from "@core/packages/item/ItemDefinition";

type Props = {
    process?: FactoryProcess;
};

export default function ProcessDisplay({ process }: Props) {
    const core = useCore();
    if (!process || !core) return <div className="flex grow border border-gray-300" />;
    return (
        <div className="flex grow border border-gray-300 p-2 space-x-4">
            <div className="grow space-y-2">
                {process.input
                    .map((batch) => ({ batch, itemDef: core.itemLibrary.getItemDef(batch.id) }))
                    .map((props) => (
                        <ItemBatchDisplay iconClass="w-4 h-4 bg-yellow-300" {...props} key={props.batch.id} />
                    ))}
            </div>
            <div className="flex flex-col justify-center items-center">
                <East />
                <span>${process.manufacturingCost.toString()}</span>
            </div>
            <div className="grow space-y-2">
                {process.output
                    .map((batch) => ({ batch, itemDef: core.itemLibrary.getItemDef(batch.id) }))
                    .map((props) => (
                        <ItemBatchDisplay iconClass="w-4 h-4 bg-blue-400" {...props} key={props.batch.id}/>
                    ))}
            </div>
        </div>
    );
}

function ItemBatchDisplay({ batch, itemDef, iconClass }: { batch: ItemBatch; itemDef: ItemDefinition; iconClass: string }) {
    return (
        <div className="flex flex-col">
            <div className="space-x-2">
                <div className={"inline-block "+iconClass} />
                <span>{batch.id}</span>
            </div>
            <div>
                <span>${itemDef.basePrice.toString()}</span> × <span>{batch.amount.toString()}</span>
                <span className="text-sm"> = ${itemDef.basePrice.times(batch.amount).toString()}</span>
            </div>
        </div>
    );
}
