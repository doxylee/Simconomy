import { FactoryRepository } from "@core/packages/factory/FactoryRepository";
import { CompanyService } from "@core/packages/company/CompanyService";
import { TurnProgressSystem } from "@core/systems/TurnProgressSystem";
import { BigNumber, BN } from "@core/common/BigNumber";
import { Factory } from "@core/packages/factory/Factory";
import { ItemStorage } from "@core/packages/item/ItemStorage";
import { FactoryProcess } from "@core/packages/factory/FactoryProcess";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { ItemLibrary } from "@core/packages/item/ItemLibrary";

const FACTORY_PRICE_PER_SIZE = 100000;
const FACTORY_PRICE_PER_STORAGE_VOLUME = 1000;

export class FactoryService {
    repository: FactoryRepository;
    userIdentity = {};

    turnProgressSystem!: TurnProgressSystem;
    companyService!: CompanyService;
    itemLibrary!: ItemLibrary;

    constructor({ repository, userIdentity }: { repository: FactoryRepository; userIdentity: {} }) {
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

        turnProgressSystem.registerCallback("factoryStep", this.progressTurn.bind(this));
    }

    /**
     * Construct a new factory for the company.
     * Company should have enough cash to construct.
     *
     * @param companyId
     * @param size
     * @param storageVolume
     */
    async createFactory({ companyId, size, storageVolume }: { companyId: string; size: BigNumber; storageVolume: BigNumber }) {
        const newFactory = new Factory({ companyId, size, storage: new ItemStorage({ maxVolume: storageVolume }) });
        const price = this.getFactoryConstructionPrice({ size, storageVolume });

        // Try to withdraw money from company
        await this.companyService.useCashOneTime({ id: companyId, amount: price });

        // Construct Factory if successful
        return await this.repository.create(newFactory);

        // TODO: If factory construction fails, withdrawn cash should be returned to the company.
    }

    /**
     * Get price for constructing a new factory with given options.
     *
     * @param size
     * @param storageVolume
     */
    getFactoryConstructionPrice({ size, storageVolume }: { size: BigNumber; storageVolume: BigNumber }) {
        return size.times(FACTORY_PRICE_PER_SIZE).plus(storageVolume.times(FACTORY_PRICE_PER_STORAGE_VOLUME));
    }

    /**
     * Get factory entity by id
     * @param id
     * @throws EntityNotFoundException
     */
    async getFactory(id: string) {
        return this.repository.read(id);
    }

    /**
     * Get all factories of a company.
     *
     * @param companyId
     */
    async getFactoriesOfCompany({ companyId }: { companyId: string }) {
        return this.repository.query({ filter: [["companyId", "=", companyId]], limit: null, showTotal: false });
    }

    /**
     * Set factory's manufacturing process.
     * Changes which product the factory produces.
     *
     * @param id
     * @param process
     * @returns updated factory entity
     * @throws EntityNotFoundException
     */
    async setFactoryProcess({ id, process }: { id: string; process: FactoryProcess }) {
        // TODO: Must incur cost for changing process.
        return this.repository.update({ id, process });
    }

    /**
     * Factory buys contracted items.
     *
     * @param factoryId
     * @param itemGroup
     * @param price
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - Volume of items is bigger than storage
     */
    async buyItem({ factoryId, itemGroup, price }: { factoryId: string; itemGroup: ItemGroup; price: BigNumber }) {
        // TODO: optionally designate itemGroupId
        const factory = await this.repository.read(factoryId);
        factory.storage.addItemGroup(itemGroup);
        await this.repository.update(factory);
        // TODO: Optimization opportunity

        await this.companyService.useCashFixed({ id: factory.companyId, amount: price });
    }

    /**
     * Factory sells contracted items.
     *
     * @param factoryId
     * @param itemGroupId
     * @param amount
     * @param price
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - Insufficient amount of items in ItemGroup
     */
    async sellItem({
        factoryId,
        itemGroupId,
        amount,
        price,
    }: {
        factoryId: string;
        itemGroupId: string;
        amount: BigNumber;
        price: BigNumber;
    }) {
        const factory = await this.repository.read(factoryId);

        const items = factory.storage.takeItems({ itemGroupId, amount });
        await this.repository.update(factory);
        // TODO: Optimization opportunity

        await this.companyService.gainRevenue({ id: factory.companyId, amount: price });

        return items;
    }

    /**
     * Get list of itemgroups in this factory.
     * Called from WholesaleMarketService.
     *
     * @param factoryId
     * @throws EntityNotFoundException
     */
    async checkItems({ factoryId }: { factoryId: string }) {
        const factory = await this.repository.read(factoryId);
        return factory.storage.items;
    }

    /**
     * Run 1 manufacture day for all factories.
     * - Use materials to manufacture products.
     * - Charge cost to company
     */
    async progressTurn() {
        const factories = await this.repository.query({ limit: null, showTotal: false });
        for (const factory of factories) {
            const runningCost = this.manufactureAndReturnCost(factory);
            await this.repository.update({ id: factory.id, storage: factory.storage });
            await this.companyService.useCashFixed({ id: factory.companyId, amount: runningCost });
        }
    }

    /**
     * Progress 1 manufacture day for a factory.
     * WARNING: Only alters the given factory instance.
     *   Caller needs to save to the repository and apply cost to company.
     * Exists on the service class due to dependency on ItemLibrary.
     *
     * @param factory
     * @private
     * @returns How much cash it cost
     */
    private manufactureAndReturnCost(factory: Factory) {
        if (factory.process === null) return BN(0);

        const materials: Record<string, ItemGroup[]> = {};
        let maxCraftableUnitsLimitedByMaterial = BN(Infinity);
        let inputVolumePerManufactureUnit = BN(0);
        factory.process.input.forEach(({ id, amount }) => {
            const itemGroups = factory.storage.getAllItemGroupsOfItemType(id);
            materials[id] = itemGroups;

            const materialCount = itemGroups.reduce((acc, cur) => acc.plus(cur.amount), BN(0));
            maxCraftableUnitsLimitedByMaterial = BigNumber.min(maxCraftableUnitsLimitedByMaterial, materialCount.div(amount));

            if (itemGroups.length > 0)
                inputVolumePerManufactureUnit = inputVolumePerManufactureUnit.plus(itemGroups[0].def.volume.times(amount));
        });

        const outputVolumePerManufactureUnit = factory.process.output.reduce(
            (acc, { id, amount }) => acc.plus(this.itemLibrary.getItemDef(id).volume.times(amount)),
            BN(0)
        );

        const volumeChangePerManufactureUnit = outputVolumePerManufactureUnit.minus(inputVolumePerManufactureUnit);

        const manufactureCount = BigNumber.min(
            maxCraftableUnitsLimitedByMaterial,
            factory.process.throughput.times(factory.size),
            volumeChangePerManufactureUnit.isPositive() // Restrict manufacturing to available space in storage. Allow manufacturing if net volume change is negative
                ? factory.storage.maxVolume.minus(factory.storage.volume).div(volumeChangePerManufactureUnit)
                : BN(Infinity)
        );

        // TODO: product quality logic
        // reduce input materials
        factory.process.input.forEach(({ id, amount }) => {
            let materialConsumption = manufactureCount.times(amount);
            for (const itemGroup of materials[id]) {
                const taken = itemGroup.take(BigNumber.min(itemGroup.amount, materialConsumption));
                materialConsumption = materialConsumption.minus(taken.amount);
            }
        });

        // add output products to storage
        factory.process.output.forEach(({ id, amount }) => {
            factory.storage.addItemGroup(new ItemGroup({ def: this.itemLibrary.getItemDef(id), amount: amount.times(manufactureCount) }));
        });

        return factory.process.manufacturingCost.times(manufactureCount);
    }
}
