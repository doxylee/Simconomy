import { GlobalStateContainer } from "@core/systems/GlobalStateContainer";
import { GlobalStateIDBMemoryHybridRepository } from "@core/systems/GlobalStateContainer/GlobalStateRepository";
import { TurnProgressSystem } from "@core/systems/TurnProgressSystem";
import { CompanyService } from "@core/packages/company/CompanyService";
import { FactoryService } from "@core/packages/factory/FactoryService";
import { RetailMarketService } from "@core/packages/retail_market/RetailMarketService";
import { ShopService } from "@core/packages/shop/ShopService";
import { WholesaleMarketService } from "@core/packages/wholesale_market/WholesaleMarketService";
import { CompanyIDBMemoryHybridRepository } from "@core/packages/company/CompanyRepository";
import { FactoryIDBMemoryHybridRepository } from "@core/packages/factory/FactoryRepository";
import { ShopIDBMemoryHybridRepository } from "@core/packages/shop/ShopRepository";
import { SupplyEntryIDBMemoryHybridRepository } from "@core/packages/wholesale_market/SupplyEntryRepository";
import { WholesaleContractIDBMemoryHybridRepository } from "@core/packages/wholesale_market/WholesaleContractRepository";
import { ItemLibrary } from "@core/packages/item/ItemLibrary";
import { FactoryProcessLibrary } from "@core/packages/factory/FactoryProcessLibrary";
import { LocalSupplierIDBMemoryHybridRepository } from "@core/packages/local_supplier/LocalSupplierRepository";
import { LocalSupplierService } from "@core/packages/local_supplier/LocalSupplierService";
import { LocalSupplierGenerator } from "@core/integration/LocalSupplierGenerator";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { uuid4 } from "@core/common/uuid";

export class ReactAdapter {
    gameId: string;
    userIdentity = {};
    repositories: IDBMemoryHybridRepository<any, any, any>[];

    globalStateContainer: GlobalStateContainer;
    turnProgressSystem: TurnProgressSystem;

    companyService: CompanyService;
    factoryService: FactoryService;
    itemLibrary: ItemLibrary;
    factoryProcessLibrary: FactoryProcessLibrary;
    localSupplierService: LocalSupplierService;
    retailMarketService: RetailMarketService;
    shopService: ShopService;
    wholesaleMarketService: WholesaleMarketService;

    userCompanyId!: string;

    constructor({ gameId = uuid4() }: { gameId?: string } = {}) {
        this.gameId = gameId;

        const globalStateRepo = new GlobalStateIDBMemoryHybridRepository({ gameId: this.gameId });
        this.globalStateContainer = new GlobalStateContainer({ repository: globalStateRepo });
        this.turnProgressSystem = new TurnProgressSystem();

        const companyRepo = new CompanyIDBMemoryHybridRepository({ gameId: this.gameId });
        this.companyService = new CompanyService({ repository: companyRepo, userIdentity: this.userIdentity });

        const factoryRepo = new FactoryIDBMemoryHybridRepository({ gameId: this.gameId });
        this.factoryService = new FactoryService({ repository: factoryRepo, userIdentity: this.userIdentity });

        this.itemLibrary = new ItemLibrary();
        this.factoryProcessLibrary = new FactoryProcessLibrary();

        const localSupplierRepo = new LocalSupplierIDBMemoryHybridRepository({ gameId: this.gameId });
        this.localSupplierService = new LocalSupplierService({ repository: localSupplierRepo, userIdentity: this.userIdentity });

        this.retailMarketService = new RetailMarketService({ userIdentity: this.userIdentity });

        const shopRepo = new ShopIDBMemoryHybridRepository({ gameId: this.gameId });
        this.shopService = new ShopService({ repository: shopRepo, userIdentity: this.userIdentity });

        const supplyEntryRepo = new SupplyEntryIDBMemoryHybridRepository({ gameId: this.gameId });
        const wholesaleContractRepo = new WholesaleContractIDBMemoryHybridRepository({ gameId: this.gameId });
        this.wholesaleMarketService = new WholesaleMarketService({
            supplyEntryRepository: supplyEntryRepo,
            wholesaleContractRepository: wholesaleContractRepo,
            userIdentity: this.userIdentity,
        });

        this.repositories = [
            globalStateRepo,
            companyRepo,
            factoryRepo,
            localSupplierRepo,
            shopRepo,
            supplyEntryRepo,
            wholesaleContractRepo,
        ];
    }

    private bindMethods(){
        this.setUserCompanyId = this.setUserCompanyId.bind(this);
        this.getUserCompanyId = this.getUserCompanyId.bind(this);
    }

    async load() {
        await Promise.all(this.repositories.map((repo) => repo.open()));
    }

    async save() {
        await Promise.all(this.repositories.map((repo) => repo.save()));
    }

    async initialize() {
        await this.globalStateContainer.initialize();
        this.turnProgressSystem.initialize(this);

        this.factoryService.initialize(this);
        this.localSupplierService.initialize(this);
        this.retailMarketService.initialize(this);
        this.shopService.initialize(this);
        this.wholesaleMarketService.initialize(this);

        await this.addLocalSuppliers();
    }

    private async addLocalSuppliers() {
        const localSupplierGenerator = new LocalSupplierGenerator();
        localSupplierGenerator.initialize(this);
        await localSupplierGenerator.generateLocalSuppliers();
    }

    setUserCompanyId(id: string) {
        this.userCompanyId = id;
    }

    getUserCompanyId() {
        return this.userCompanyId;
    }
}
