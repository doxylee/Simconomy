import { CompanyService } from "@core/packages/company/CompanyService";
import { TurnProgressSystem } from "@core/systems/TurnProgressSystem";
import { BigNumber } from "@core/common/BigNumber";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { ItemLibrary } from "@core/packages/item/ItemLibrary";
import { LocalSupplierRepository } from "@core/packages/local_supplier/LocalSupplierRepository";
import { LocalSupplier } from "@core/packages/local_supplier/LocalSupplier";

export class LocalSupplierService {
    repository: LocalSupplierRepository;
    userIdentity = {};
    
    turnProgressSystem!: TurnProgressSystem;
    companyService!: CompanyService;
    itemLibrary!: ItemLibrary;
    
    constructor({repository, userIdentity}: { repository: LocalSupplierRepository; userIdentity: {} }) {
        this.repository = repository;
        this.userIdentity = userIdentity;
    }
    
    /**
     * Add reference to other services/systems.
     *
     * @param turnProgressSystem
     * @param companyService
     * @param itemLibrary
     */
    initialize({
                   turnProgressSystem,
                   companyService,
                   itemLibrary,
               }: {
        turnProgressSystem: TurnProgressSystem;
        companyService: CompanyService;
        itemLibrary: ItemLibrary;
    }) {
        this.turnProgressSystem = turnProgressSystem;
        this.companyService = companyService;
        this.itemLibrary = itemLibrary;
    }
    
    /**
     * Construct a new LocalSupplier that sells certain item.
     * Company should be an NPC.
     *
     * @param companyId
     * @param sellingItemTemplate
     */
    async createLocalSupplier({companyId, sellingItemTemplate}: { companyId: string; sellingItemTemplate: ItemGroup }) {
        const newLocalSupplier = new LocalSupplier({companyId, sellingItemTemplate});
        return await this.repository.create(newLocalSupplier);
    }
    
    /**
     * Get LocalSupplier entity by id
     * @param id
     * @throws EntityNotFoundException
     */
    async getLocalSupplier(id: string) {
        return this.repository.read(id);
    }
    
    /**
     * LocalSupplier sells contracted items.
     * WARNING: Does not check having sufficient stock.
     * TODO: Takes same parameters as factories just in case. Might need to change.
     *
     * @param localSupplierId
     * @param itemGroupId
     * @param amount
     * @param price
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - Insufficient amount of items in ItemGroup (TODO: This is never raised)
     */
    async sellItem({
                       localSupplierId,
                       itemGroupId,
                       amount,
                       price,
                   }: {
        localSupplierId: string;
        itemGroupId: string;
        amount: BigNumber;
        price: BigNumber;
    }) {
        const localSupplier = await this.repository.read(localSupplierId);
        return localSupplier.sellingItemTemplate.take(amount); // Not saved to repository
        // TODO: Might need to track remaining stock also from LocalSupplier.
        //  WholesaleMarketService must only request items less or equal to stock.
    }
    
    /**
     * Get list of itemgroups in this LocalSupplier.
     * Called from WholesaleMarketService.
     *
     * @param localSupplierId
     * @throws EntityNotFoundException
     */
    async checkItems({localSupplierId}: { localSupplierId: string }) {
        const localSupplier = await this.repository.read(localSupplierId);
        return [localSupplier.sellingItemTemplate];
    }
}
