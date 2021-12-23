import BigNumber, { BN } from "@core/common/BigNumber";
import { Tooltip } from "@mui/material";

type Props = {
    total: BigNumber;
    product?: BigNumber;
    material?: BigNumber;
    others?: BigNumber;
};

export function StorageVerticalGraph({ total, product = BN(0), material = BN(0), others = BN(0) }: Props) {
    const getPercent = (volume: BigNumber) => volume.div(total).times(100).toFixed(0) + "%";

    return (
        <div className="flex flex-col w-4 items-stretch border border-gray-300">
            <div className="grow" />
            <Tooltip title={"Product"} placement="left" arrow>
                <div className="bg-blue-400" style={{ height: getPercent(product) }} />
            </Tooltip>
            <Tooltip title={"Material"} placement="left" arrow>
                <div className="bg-yellow-300" style={{ height: getPercent(material) }} />
            </Tooltip>
            <Tooltip title={"Others"} placement="left" arrow>
                <div className="bg-gray-400" style={{ height: getPercent(others) }} />
            </Tooltip>
        </div>
    );
}
