import { Card, CardActionArea, CardContent, Divider } from "@mui/material";
import { Factory } from "@core/packages/factory/Factory";
import { useCore } from "@src/utils/useCore";
import { nFormat, toPercent } from "@src/utils/numberPresentation";
import { StorageVerticalGraph } from "@src/components/specific/factories/StorageVerticalGraph";
import { BN } from "@core/common/BigNumber";

interface Props {
    factory: Factory;
    className?: string;
}

export default function FactoryListItem({ factory, className }: Props) {
    const core = useCore();
    if (!core) return null;

    const { process, storage } = factory;
    const primaryProduct = process ? core.itemLibrary.getItemDef(process.output[0].id) : null;
    const baseCost = process
        ? process!.input
              .reduce((prev, item) => prev.plus(core?.itemLibrary.getItemDef(item.id).basePrice), process.manufacturingCost)
              .div(process.output[0].amount)
        : null;

    const inputItemIds = process ? process.input.map((batch) => batch.id) : [];
    const inputItemsVolume = storage.items.reduce(
        (prev, items) => (inputItemIds.includes(items.def.id) ? prev.plus(items.volume) : prev),
        BN(0)
    );

    const outputItemIds = process ? process.output.map((batch) => batch.id) : [];
    const outputItemsVolume = storage.items.reduce(
        (prev, items) => (outputItemIds.includes(items.def.id) ? prev.plus(items.volume) : prev),
        BN(0)
    );

    return (
        <Card className={className}>
            <CardActionArea>
                <CardContent className="flex flex-row items-stretch space-x-4">
                    <div className="basis-40">
                        <div className="text-2xl">Factory</div>
                        <div className="text-base">Seoul</div>
                        <div className="text-base">size: {factory.size.toString()}</div>
                        <div className="text-base">eff:</div>
                    </div>
                    <Divider orientation="vertical" flexItem />

                    <div className="flex space-x-2">
                        <div className="w-32 h-32 bg-gray-300" />
                        <div>
                            {primaryProduct ? (
                                <>
                                    <div className="text-2xl">{primaryProduct.id}</div>
                                    <div className="text-base">🎁 ${primaryProduct.basePrice.toPrecision(3)}</div>
                                    <div className="text-base">📦 ${baseCost!.toPrecision(3)}</div>
                                    <div className="text-base">quality, brand</div>
                                </>
                            ) : (
                                <div className="text-lg">No product</div>
                            )}
                        </div>
                    </div>
                    <Divider orientation="vertical" flexItem />

                    <div className="grow">
                        <div className="flex justify-between">
                            <div>Revenue</div>
                            <div></div>
                        </div>
                    </div>
                    <Divider orientation="vertical" flexItem />

                    <div className="grow">
                        <div className="flex justify-between">
                            <div>Profit</div>
                            <div></div>
                        </div>
                    </div>
                    <Divider orientation="vertical" flexItem />

                    <div className="flex space-x-2">
                        <StorageVerticalGraph
                            total={storage.maxVolume}
                            product={outputItemsVolume}
                            material={inputItemsVolume}
                            others={storage.volume.minus(outputItemsVolume).minus(inputItemsVolume)}
                        />
                        <div>
                            <div>
                                <span className="text-xl">{toPercent(storage.volume.div(storage.maxVolume))} </span>
                                <span className="text-sm">
                                    ({nFormat(storage.volume, { d: 2 })}/{nFormat(storage.maxVolume, { d: 2 })} m³)
                                </span>
                            </div>
                            <div>
                                <span className="text-base">🎁 {toPercent(outputItemsVolume.div(storage.maxVolume))} </span>
                                <span className="text-sm">({nFormat(outputItemsVolume, { d: 3 })} m³)</span>
                            </div>
                            <div>
                                <span className="text-base">📦 {toPercent(inputItemsVolume.div(storage.maxVolume))} </span>
                                <span className="text-sm">({nFormat(inputItemsVolume, { d: 3 })} m³)</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
