import { describe, expect, it } from "@jest/globals";
import { TestAdapter } from "@core/tests/TestAdapter";
import { BN } from "@core/common/BigNumber";
import { FactoryProcess } from "@core/packages/factory/FactoryProcess";
import { SaleEntry } from "@core/packages/shop/SaleEntry";

describe("Basic e2e scenario", () => {
    it("Can create factory, manufacture items, sell at shop", async () => {
        const adapter = new TestAdapter();
        await adapter.initialize();

        // create company
        let company = await adapter.companyService.createCompany({ name: "test company", cash: BN(10_000_000) });
        expect(company.cash).toEqual(BN(10_000_000));

        // create factory
        let factory_1 = await adapter.factoryService.createFactory({ companyId: company.id, size: BN(1), storageVolume: BN(10) });
        company = await adapter.companyService.getCompany(company.id);
        expect(company.cash).toEqual(BN(10_000_000 - 100_000 - 10 * 1000));

        // set factory process
        const goldRingProcess = adapter.factoryProcessLibrary.getFactoryProcessById("goldRing");
        expect(goldRingProcess).not.toBe(undefined);

        factory_1 = await adapter.factoryService.setFactoryProcess({ id: factory_1.id, process: goldRingProcess as FactoryProcess });
        expect(factory_1.process).toEqual(goldRingProcess);

        // set factory gold supply
        const goldSupplies = await adapter.wholesaleMarketService.querySuppliers({
            filter: [["productId", "=", "gold"]],
            showTotal: false,
        });
        const goldSupply = goldSupplies[0];
        expect(goldSupply).toEqual(expect.objectContaining({ firmType: "localSupplier", productId: "gold" }));

        const goldBuyAmount = BN(1000);
        const goldSupplyContract = await adapter.wholesaleMarketService.createContract({
            supplyId: goldSupply.id,
            buyerCompanyId: company.id,
            buyerFirmType: "factory",
            buyerFirmId: factory_1.id,
            amount: goldBuyAmount,
        });
        expect(goldSupplyContract).toEqual(
            expect.objectContaining({ supplyEntryId: goldSupply.id, buyerFirmId: factory_1.id, productId: "gold" })
        );

        // test gold wholesale
        expect(factory_1.storage.volume).toEqual(BN(0));
        expect(factory_1.storage.items.length).toBe(0);

        let companyCashPrior = company.cash;
        await adapter.turnProgressSystem.progressTurn();
        factory_1 = await adapter.factoryService.getFactory(factory_1.id);

        let factory_1_gold_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("gold")[0];
        expect(factory_1.storage.volume).toEqual(adapter.itemLibrary.getItemDef("gold").volume.times(goldBuyAmount));
        expect(factory_1_gold_itemGroup).toEqual(
            expect.objectContaining({ def: expect.objectContaining({ id: "gold" }), amount: goldBuyAmount })
        );

        company = await adapter.companyService.getCompany(company.id);
        expect(company.cash).toEqual(companyCashPrior.minus(goldSupply.price.times(goldBuyAmount)));

        // test goldRing manufacture
        await adapter.turnProgressSystem.progressTurn();
        factory_1 = await adapter.factoryService.getFactory(factory_1.id);
        factory_1_gold_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("gold")[0];
        let factory_1_goldRing_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("goldRing")[0];

        expect(factory_1_goldRing_itemGroup.amount).toEqual(BN(50));
        expect(factory_1_gold_itemGroup.amount).toEqual(BN(1800));

        // register factory as goldRing supplier
        const goldRingSupply = await adapter.wholesaleMarketService.registerSupply({
            companyId: company.id,
            firmType: "factory",
            firmId: factory_1.id,
            itemGroup: factory_1_goldRing_itemGroup,
            price: factory_1_goldRing_itemGroup.def.basePrice,
            status: "public",
        });
        expect(goldRingSupply).toEqual(expect.objectContaining({ firmType: "factory", productId: "goldRing" }));

        // create shop
        company = await adapter.companyService.getCompany(company.id);
        companyCashPrior = company.cash;
        let shop_1 = await adapter.shopService.createShop({ companyId: company.id, size: BN(1), storageVolume: BN(10) });
        company = await adapter.companyService.getCompany(company.id);
        expect(company.cash).toEqual(companyCashPrior.minus(400000 + 10 * 1000));

        // set shop goldRing supply
        const goldRingBuyAmount = BN(40);
        const goldRingSupplyContract = await adapter.wholesaleMarketService.createContract({
            supplyId: goldRingSupply.id,
            buyerCompanyId: company.id,
            buyerFirmType: "shop",
            buyerFirmId: shop_1.id,
            amount: goldRingBuyAmount,
        });
        expect(goldRingSupplyContract).toEqual(
            expect.objectContaining({ supplyEntryId: goldRingSupply.id, buyerFirmId: shop_1.id, productId: "goldRing" })
        );

        // test goldRing wholesale between factory and shop
        companyCashPrior = company.cash;
        await adapter.turnProgressSystem.progressTurn();
        company = await adapter.companyService.getCompany(company.id);
        expect(company.cash).toEqual(
            companyCashPrior
                .minus(goldSupply.price.times(goldBuyAmount))
                .minus(50 * 40 /* gold ring manufacture cost */)
                .plus(goldRingSupply.price.times(goldRingBuyAmount))
                .minus(goldRingSupply.price.times(goldRingBuyAmount))
        );
        factory_1 = await adapter.factoryService.getFactory(factory_1.id);
        factory_1_goldRing_itemGroup = factory_1.storage.getAllItemGroupsOfItemType("goldRing")[0];
        expect(factory_1_goldRing_itemGroup.amount).toEqual(BN(50 * 2).minus(goldRingBuyAmount));

        shop_1 = await adapter.shopService.getShop(shop_1.id);
        let shop_1_goldRing_itemGroup = shop_1.storage.getAllItemGroupsOfItemType("goldRing")[0];
        expect(shop_1_goldRing_itemGroup.amount).toEqual(goldRingBuyAmount);

        // set shop's sale entry
        const goldRingSaleEntry: SaleEntry = {
            itemId: "goldRing",
            itemGroupId: shop_1_goldRing_itemGroup.groupId,
            price: shop_1_goldRing_itemGroup.def.basePrice,
        };
        const shop_1_selling = await adapter.shopService.setSelling({ shopId: shop_1.id, selling: [goldRingSaleEntry] });

        companyCashPrior = company.cash;
        await adapter.turnProgressSystem.progressTurn();
        company = await adapter.companyService.getCompany(company.id);

        shop_1 = await adapter.shopService.getShop(shop_1.id);
        shop_1_goldRing_itemGroup = shop_1.storage.getAllItemGroupsOfItemType("goldRing")[0];

        const goldRingRetailSoldAmount = goldRingBuyAmount.times(2).minus(shop_1_goldRing_itemGroup.amount).toNumber();
        expect(goldRingRetailSoldAmount).toBeGreaterThan(10);
        expect(goldRingRetailSoldAmount).toBeLessThanOrEqual(goldRingBuyAmount.toNumber());
        expect(company.cash).toEqual(
            companyCashPrior
                .minus(goldSupply.price.times(goldBuyAmount))
                .minus(50 * 40 /* gold ring manufacture cost */)
                .plus(goldRingSupply.price.times(goldRingBuyAmount))
                .minus(goldRingSupply.price.times(goldRingBuyAmount))
                .plus(goldRingSaleEntry.price.times(goldRingRetailSoldAmount))
        );
    });
});
