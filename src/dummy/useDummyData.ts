import { ReactAdapter } from "@src/adapter/ReactAdapter";
import { useEffect } from "react";
import { BN } from "@core/common/BigNumber";
import { FactoryProcess } from "@core/packages/factory/FactoryProcess";
import { SaleEntry } from "@core/packages/shop/SaleEntry";

export function useDummyData(core: ReactAdapter | null) {
    useEffect(() => {
        if (!core) return;
        runDummyScenario(core);
    }, [core]);
}

export const runDummyScenario = async (core: ReactAdapter) => {
    // create company
    let company = await core.companyService.createCompany({ name: "test company", cash: BN(10_000_000) });
    core.setUserCompanyId(company.id);

    // create factory
    let factory_1 = await core.factoryService.createFactory({ companyId: company.id, size: BN(1), storageVolume: BN(10) });
    company = await core.companyService.getCompany(company.id);

    // set factory process
    const goldRingProcess = core.factoryProcessLibrary.getFactoryProcessById("goldRing");

    factory_1 = await core.factoryService.setFactoryProcess({ id: factory_1.id, process: goldRingProcess as FactoryProcess });

    // set factory gold supply
    const goldSupplies = await core.wholesaleMarketService.querySuppliers({
        filter: [["productId", "=", "gold"]],
        showTotal: false,
    });
    const goldSupply = goldSupplies[0];

    const goldBuyAmount = BN(1000);
    const goldSupplyContract = await core.wholesaleMarketService.createContract({
        supplyId: goldSupply.id,
        buyerCompanyId: company.id,
        buyerFirmType: "factory",
        buyerFirmId: factory_1.id,
        amount: goldBuyAmount,
    });

    let companyCashPrior = company.cash;
    await core.turnProgressSystem.progressTurn();
    factory_1 = await core.factoryService.getFactory(factory_1.id);

    let factory_1_gold_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("gold")[0];

    company = await core.companyService.getCompany(company.id);

    // test goldRing manufacture
    await core.turnProgressSystem.progressTurn();
    factory_1 = await core.factoryService.getFactory(factory_1.id);
    factory_1_gold_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("gold")[0];
    let factory_1_goldRing_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("goldRing")[0];

    // register factory as goldRing supplier
    const goldRingSupply = await core.wholesaleMarketService.registerSupply({
        companyId: company.id,
        firmType: "factory",
        firmId: factory_1.id,
        itemGroup: factory_1_goldRing_itemGroup,
        price: factory_1_goldRing_itemGroup.def.basePrice,
        status: "public",
    });

    // create shop
    company = await core.companyService.getCompany(company.id);
    companyCashPrior = company.cash;
    let shop_1 = await core.shopService.createShop({ companyId: company.id, size: BN(1), storageVolume: BN(10) });
    company = await core.companyService.getCompany(company.id);

    // set shop goldRing supply
    const goldRingBuyAmount = BN(40);
    const goldRingSupplyContract = await core.wholesaleMarketService.createContract({
        supplyId: goldRingSupply.id,
        buyerCompanyId: company.id,
        buyerFirmType: "shop",
        buyerFirmId: shop_1.id,
        amount: goldRingBuyAmount,
    });

    // test goldRing wholesale between factory and shop
    companyCashPrior = company.cash;
    await core.turnProgressSystem.progressTurn();
    company = await core.companyService.getCompany(company.id);

    factory_1 = await core.factoryService.getFactory(factory_1.id);
    factory_1_goldRing_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("goldRing")[0];

    shop_1 = await core.shopService.getShop(shop_1.id);
    let shop_1_goldRing_itemGroup = shop_1.storage.getAllItemGroupsOfItemType("goldRing")[0];

    // set shop's sale entry
    const goldRingSaleEntry: SaleEntry = {
        itemId: "goldRing",
        itemGroupId: shop_1_goldRing_itemGroup.groupId,
        price: shop_1_goldRing_itemGroup.def.basePrice,
    };
    const shop_1_selling = await core.shopService.setSelling({ shopId: shop_1.id, selling: [goldRingSaleEntry] });

    companyCashPrior = company.cash;
    await core.turnProgressSystem.progressTurn();
    company = await core.companyService.getCompany(company.id);

    shop_1 = await core.shopService.getShop(shop_1.id);
    shop_1_goldRing_itemGroup = shop_1.storage.getAllItemGroupsOfItemType("goldRing")[0];

    const goldRingRetailSoldAmount = goldRingBuyAmount.times(2).minus(shop_1_goldRing_itemGroup.amount).toNumber();
};
