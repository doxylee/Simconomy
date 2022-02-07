import BigNumber, { BN } from "@core/common/BigNumber";
import { VerticalBarIndicator } from "@src/components/common/VerticalBarIndicator";

type Props = {
    total: BigNumber;
    product?: BigNumber;
    material?: BigNumber;
    others?: BigNumber;
};

export function StorageVerticalGraph({ total, product = BN(0), material = BN(0), others = BN(0) }: Props) {
    const getValue = (volume: BigNumber) => volume.div(total).toNumber();

    return (
        <VerticalBarIndicator
            values={[
                { value: getValue(product), className: "bg-blue-400", tooltip: "Product" },
                { value: getValue(material), className: "bg-yellow-300", tooltip: "Material" },
                { value: getValue(others), className: "bg-gray-400", tooltip: "Others" },
            ]}
            styleClassOverride="w-4 border border-gray-300"
            tooltipPlacement="right"
        />
    );
}
