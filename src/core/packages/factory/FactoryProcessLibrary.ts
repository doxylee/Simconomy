import { FactoryProcess } from "@core/packages/factory/FactoryProcess";
import { BN } from "@core/common/BigNumber";

const FACTORY_PROCESS_LIST = [
    new FactoryProcess({
        id: "steel", // Typically, it takes 1.6 tonnes of iron ore and around 450kg of coke to produce a tonne of pig iron
        input: [
            { id: "coal", amount: BN(45) }, // or 50
            { id: "ironOre", amount: BN(160) }, // or 180 since pig iron, not steel
        ],
        output: [{ id: "steel", amount: BN(100) }],
        throughput: BN(200), // TODO: no ref
        manufacturingCost: BN(20), // TODO: no ref (input 0.085*45+0.1*160=19.825+transport, output 0.55*100=55)
    }),
    new FactoryProcess({
        id: "copper", // Copper is typically extracted from oxide and sulfide ores that contain between 0.5 and 2.0% copper.
        input: [{ id: "copperOre", amount: BN(100) }],
        output: [{ id: "copper", amount: BN(2) }],
        throughput: BN(1000), // TODO: no ref
        manufacturingCost: BN(4), // TODO: no ref (input 0.04*100=4+transport, output 5.5*2=11)
    }),
    new FactoryProcess({
        id: "oilDistill", // 1.7kg of PET can be made with 1kg of PX
        input: [{ id: "crudeOil", amount: BN(1) }], // 159L
        output: [
            { id: "gasoline", amount: BN(73) }, // 73L (46%)
            { id: "naphtha", amount: BN(50) }, // 65L (41%)
        ],
        throughput: BN(100), // TODO: no ref
        manufacturingCost: BN(20), // TODO: no ref (input 70*1=70+transport, output 0.52*73+1.5*50=112.96)
    }),
    new FactoryProcess({
        id: "plastic", // 1.7kg of PET can be made with 1kg of PX
        input: [{ id: "naphtha", amount: BN(10) }],
        output: [{ id: "plastic", amount: BN(17) }],
        throughput: BN(1000), // TODO: no ref
        manufacturingCost: BN(1), // TODO: no ref (input 1.5*10=15+transport, output 1.1*17=18.7)
    }),
    new FactoryProcess({
        id: "siliconWafer", // 1.7kg of PET can be made with 1kg of PX
        input: [{ id: "silica", amount: BN(50) }], // use 50 multiple of silica because it's based on low quality silica for glass
        output: [{ id: "siliconWafer", amount: BN(10) }], // TODO: no ref
        throughput: BN(50), // TODO: no ref
        manufacturingCost: BN(900), // TODO: no ref (input 0.1*50=5+transport, output 100*10=1000)
    }),
    new FactoryProcess({
        id: "glass", // 1.7kg of PET can be made with 1kg of PX
        input: [{ id: "silica", amount: BN(100) }],
        output: [{ id: "glass", amount: BN(95) }], // TODO: no ref
        throughput: BN(200), // TODO: no ref
        manufacturingCost: BN(25), // TODO: no ref (input 0.1*100=10+transport, output 0.5*95=47.5)
    }),
    new FactoryProcess({
        id: "electronicComponents", // 1.7kg of PET can be made with 1kg of PX
        input: [
            { id: "siliconWafer", amount: BN(1) }, // TODO: no ref
            { id: "plastic", amount: BN(15) },
            { id: "copper", amount: BN(1) },
        ],
        output: [{ id: "electronicComponents", amount: BN(500) }],
        throughput: BN(50), // TODO: no ref
        manufacturingCost: BN(300), // TODO: no ref (input 100*1+1.1*15+5.5*1=122+transport, output 1*500=500)
    }),
    // consumer products' base price contains retail margin
    new FactoryProcess({
        id: "goldRing",
        input: [{ id: "gold", amount: BN(4) }],
        output: [{ id: "goldRing", amount: BN(1) }],
        throughput: BN(50), // TODO: no ref
        manufacturingCost: BN(40), // TODO: no ref (input 4*40=160+transport, output 1*300=300)
    }),
    new FactoryProcess({
        id: "watch",
        input: [
            { id: "steel", amount: BN(4) },
            { id: "glass", amount: BN(1) },
            { id: "electronicComponents", amount: BN(10) },
        ],
        output: [{ id: "watch", amount: BN(40) }],
        throughput: BN(5), // TODO: no ref
        manufacturingCost: BN(400), // TODO: no ref (input 0.55*4+0.5*1+1*10=12.7+transport, output 30*40=1200)
    }),
    new FactoryProcess({
        id: "electronicWatch",
        input: [
            { id: "plastic", amount: BN(4) },
            { id: "electronicComponents", amount: BN(40) },
        ],
        output: [{ id: "electronicWatch", amount: BN(40) }],
        throughput: BN(5), // TODO: no ref
        manufacturingCost: BN(300), // TODO: no ref (input 1.1*4+1*40=44.4+transport, output 20*40=800)
    }),
];

// TODO: freeze definitions if needed
const FACTORY_PROCESS_DEFINITIONS: Record<string, FactoryProcess> = Object.fromEntries(
    FACTORY_PROCESS_LIST.map((process) => [process.id, process])
);

export class FactoryProcessLibrary {
    getAllFactoryProcesses() {
        return Object.values(FACTORY_PROCESS_DEFINITIONS);
    }
}
