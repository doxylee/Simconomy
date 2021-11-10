import { ItemDefinition } from "@core/packages/item/ItemDefinition";
import { EntityNotFoundException } from "@core/common/exceptions";
import { BN } from "@core/common/BigNumber";

// most of price comes from https://tradingeconomics.com/

const ITEM_DEF_LIST = [
    new ItemDefinition({ id: "lumber", basePrice: BN(0.085), mass: BN(1), volume: BN(0.002_360) }), // lumber 0.3 USD/board feet avg around 1990-2020,

    new ItemDefinition({ id: "coal", basePrice: BN(0.085), mass: BN(1), volume: BN(0.001_000) }), // coal 85 (50-125) USD/T avg around 2010-2020, density 1.0
    new ItemDefinition({ id: "ironOre", basePrice: BN(0.1), mass: BN(1), volume: BN(0.000_200) }), // iron ore 100 (50-200) USD/T avg around 2010-2020, density 5.0 (
    new ItemDefinition({ id: "copperOre", basePrice: BN(0.04), mass: BN(1), volume: BN(0.000_238) }), // copper pyrite density 4.2 ? // too little copper in ore. copper probably gets processed near the mine?
    // new ItemDefinition({ id: "goldOre", basePrice: BN(0), mass: BN(0), volume: BN(0) }), // too little gold in ore. gold probably gets processed near the mine?
    new ItemDefinition({ id: "silica", basePrice: BN(0.1), mass: BN(1), volume: BN(0.000_693_5) }),
    // indiamart sand about 1000~4000Rs(13.36~53.43USD) per ton, alibaba high purity for glass 100~150USD/t. normal loose dry sand density 1.442
    // silicon 1 USD/lb around 2015-2020 https://www.statista.com/statistics/301564/us-silicon-price-by-type/, very pure silica(for microchip) can be up to 5 USD/kg
    new ItemDefinition({ id: "crudeOil", basePrice: BN(70), mass: BN(140), volume: BN(0.159) }), // crude oil 70 UDS/Bbl avg around 2005-2020

    new ItemDefinition({ id: "steel", basePrice: BN(0.55), mass: BN(1), volume: BN(0.000_125) }), // steel 3500 CNY/T avg around 2010-2020
    new ItemDefinition({ id: "copper", basePrice: BN(5.5), mass: BN(1), volume: BN(0.000_112) }), // copper 2.5 USD/lb avg around 2005-2020
    new ItemDefinition({ id: "gold", basePrice: BN(40), mass: BN(0.001), volume: BN(0.000_000_051_81) }), // gold 1250 USD/t.oz around 2015

    new ItemDefinition({ id: "siliconWafer", basePrice: BN(100), mass: BN(0.1), volume: BN(0.000_010) }), // TODO: no ref $100 for 200mm wafer?
    new ItemDefinition({ id: "glass", basePrice: BN(0.5), mass: BN(1), volume: BN(0.000_400) }), // density 2.5 // TODO: no ref

    new ItemDefinition({ id: "naphtha", basePrice: BN(1.5), mass: BN(1), volume: BN(0.001_300) }), // price verified, density 0.75-0.785
    new ItemDefinition({ id: "gasoline", basePrice: BN(0.52), mass: BN(0.75), volume: BN(0.001) }), // gasoline 2 USD/gal avg around 2006-2020, density 0.7-0.8
    new ItemDefinition({ id: "plastic", basePrice: BN(1.1), mass: BN(1), volume: BN(0.001_000) }), // price verified, density varies 0.9~1.5

    new ItemDefinition({ id: "electronicComponents", basePrice: BN(1), mass: BN(0.02), volume: BN(0.000_050) }), // TODO: no ref, price will vary greatly on type or quality. very small unit. about 5x5cm square?
    
    // Bigger volume due to packaging
    new ItemDefinition({ id: "goldRing", basePrice: BN(300), mass: BN(0.004), volume: BN(0.000_150) }),
    new ItemDefinition({ id: "watch", basePrice: BN(30), mass: BN(0.100), volume: BN(0.000_250) }),
    new ItemDefinition({ id: "electronicWatch", basePrice: BN(20), mass: BN(0.050), volume: BN(0.000_250) }),
];

// TODO: freeze definitions if needed
const ITEM_DEFINITIONS: Record<string, ItemDefinition> = Object.fromEntries(ITEM_DEF_LIST.map((item) => [item.id, item]));

export class ItemLibrary {
    getItemDef(itemId: string) {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (itemDef) return itemDef;
        // TODO: EntityNotFoundException is thrown even when ItemDefinition is not an entity.
        throw new EntityNotFoundException({ entityType: "ItemDefinition", entityId: itemId });
    }
}
