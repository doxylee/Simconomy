import { WholesaleMarketService } from "@core/packages/wholesale_market/WholesaleMarketService";
import { LocalSupplierService } from "@core/packages/local_supplier/LocalSupplierService";
import { CompanyService } from "@core/packages/company/CompanyService";
import { BigNumber, BN } from "@core/common/BigNumber";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { ItemDefinition } from "@core/packages/item/ItemDefinition";
import { ItemLibrary } from "@core/packages/item/ItemLibrary";
import { Company } from "@core/packages/company/Company";

export class LocalSupplierGenerator {
    companyService!: CompanyService;
    wholesaleMarketService!: WholesaleMarketService;
    localSupplierService!: LocalSupplierService;
    itemLibrary!: ItemLibrary;

    localSupplierCompany!: Company;

    itemPriceMultiplier = 1.1;

    constructor() {}

    /**
     * Add reference to other services/systems.
     *
     * @param companyService
     * @param wholesaleMarketService
     * @param localSupplierService
     * @param itemLibrary
     */
    initialize({
        companyService,
        wholesaleMarketService,
        localSupplierService,
        itemLibrary,
    }: {
        companyService: CompanyService;
        wholesaleMarketService: WholesaleMarketService;
        localSupplierService: LocalSupplierService;
        itemLibrary: ItemLibrary;
    }) {
        this.companyService = companyService;
        this.wholesaleMarketService = wholesaleMarketService;
        this.localSupplierService = localSupplierService;
        this.itemLibrary = itemLibrary;
    }

    async generateLocalSuppliers() {
        await this.createLocalSupplierCompany();
        await Promise.all([this.createLocalSupplyOfItemType("gold", BN(1_000_000))]);
    }

    private async createLocalSupplierCompany() {
        this.localSupplierCompany = await this.companyService.createCompany({ name: "Local Supplier", cash: BN(0) });
    }

    private async createLocalSupplyOfItemType(itemId: string, amount: BigNumber) {
        const itemDef = this.itemLibrary.getItemDef(itemId);
        return this.createLocalSupply(itemDef, amount, itemDef.basePrice.times(this.itemPriceMultiplier), this.localSupplierCompany.id);
    }

    private async createLocalSupply(def: ItemDefinition, amount: BigNumber, price: BigNumber, companyId: string) {
        const sellingItemTemplate = new ItemGroup({ def, amount });
        const newFirm = await this.localSupplierService.createLocalSupplier({ companyId, sellingItemTemplate });
        return await this.wholesaleMarketService.registerSupply({
            companyId,
            firmType: "localSupplier",
            firmId: newFirm.id,
            price,
            itemGroup: sellingItemTemplate,
            status: "public",
        });
    }
}
