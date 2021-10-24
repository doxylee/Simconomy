import { FactoryProcess } from "@core/packages/factory/FactoryProcess";
import { BN } from "@core/common/BigNumber";

// TODO: freeze definitions if needed
const FACTORY_PROCESS_DEFINITIONS: Record<string, FactoryProcess> = {
    steel: new FactoryProcess({
        id: "steel",
        input: [{ id: "coal", amount: BN(1) }],
        output: [{ id: "steel", amount: BN(1) }],
        throughput: BN(100_000),
        manufacturingCost: BN(100),
    }),
};

export class FactoryProcessLibrary {
    getAllFactoryProcesses() {
        return Object.values(FACTORY_PROCESS_DEFINITIONS);
    }
}
