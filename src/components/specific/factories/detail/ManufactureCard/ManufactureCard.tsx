import { Card } from "@mui/material";
import ProcessDisplay from "@src/components/specific/factories/detail/ManufactureCard/ProcessDisplay";
import { dummyFactory2 } from "@src/dummy/dummyFactory2";
import { BN } from "@core/common/BigNumber";
import { useCore } from "@src/utils/useCore";
import { Factory } from "@core/packages/factory/Factory";

type Props = {
    factory: Factory;
};

export default function ManufactureCard({ factory }: Props) {
    const core = useCore();
    const process = factory.process;
    if (!process || !core) return null;

    const fixedCost = BN(10000); // TODO: dummy
    const materialCost = process.input.reduce(
        (acc, cur) => acc.plus(core.itemLibrary.getItemDef(cur.id).basePrice.times(cur.amount)),
        BN(0)
    );
    const productPrice = process.output.reduce(
        (acc, cur) => acc.plus(core.itemLibrary.getItemDef(cur.id).basePrice.times(cur.amount)),
        BN(0)
    );
    const marginOfFullThroughput = process.throughput
        .times(productPrice.minus(materialCost).minus(process.manufacturingCost))
        .minus(fixedCost);

    return (
        <Card className="flex grow flex-col p-4 space-y-4">
            <ProcessDisplay process={process} />
            <div>
                <div>Fixed cost: ${fixedCost.toString()}</div>
                <div>Throughput: {process.throughput.toString()}</div>
                <div>Margin of full throughput: ${marginOfFullThroughput.toString()}</div>
            </div>
        </Card>
    );
}
