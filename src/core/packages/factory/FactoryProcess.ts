import { DataObject } from "@core/common/dataobject";
import { BigNumber } from "@core/common/BigNumber";

type ItemBatch = { id: string; amount: BigNumber };

/**
 * Recipe for manufacturing products in the factory.
 * Input, output is the smallest unit of manufacturing.
 *
 * Multiply input, output amount by throughput to get
 *  how much item is consumed / produced in a day on size 1 factory.
 */
export class FactoryProcess extends DataObject {
    id: string;

    /**
     * Input materials for 1 unit of this process.
     * Item type must be distinct.
     */
    input: ItemBatch[];
    /** Output products for 1 unit of this process. */
    output: ItemBatch[];
    /** How many units of this process can be processed in a day on size 1 factory. */
    throughput: BigNumber;
    /** How much it costs for 1 unit of this process. */
    manufacturingCost: BigNumber;

    constructor({ id, input, output, throughput, manufacturingCost: manufacturingCost }: FactoryProcess) {
        super();
        this.id = id;
        this.input = input;
        this.output = output;
        this.throughput = throughput;
        this.manufacturingCost = manufacturingCost;
    }
}
