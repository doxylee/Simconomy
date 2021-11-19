import { WholesaleContractRepository } from "@core/packages/wholesale_market/WholesaleContractRepository";
import {
    SupplyEntryFilterExpressions,
    SupplyEntryRepository,
    SupplyEntrySortableFields,
} from "@core/packages/wholesale_market/SupplyEntryRepository";
import { TurnProgressSystem } from "@core/systems/TurnProgressSystem";
import { CompanyService } from "@core/packages/company/CompanyService";
import { FactoryService } from "@core/packages/factory/FactoryService";
import { ShopService } from "@core/packages/shop/ShopService";
import { FirmType } from "@core/common/FirmType";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { SupplyEntry, SupplyEntryStatus } from "@core/packages/wholesale_market/SupplyEntry";
import { BigNumber } from "@core/common/BigNumber";
import { ConflictException, EntityNotFoundException, UnexpectedError } from "@core/common/exceptions";
import { WholesaleContract } from "@core/packages/wholesale_market/WholesaleContract";
import { EntityBasicFilterExpression, EntityBasicSortableFields, SortExpression } from "@src/core/common/repository";
import partition from "lodash/partition";
import { LocalSupplierService } from "@core/packages/local_supplier/LocalSupplierService";

export class WholesaleMarketService {
    supplyEntryRepository: SupplyEntryRepository;
    wholesaleContractRepository: WholesaleContractRepository;
    userIdentity = {};

    turnProgressSystem!: TurnProgressSystem;
    companyService!: CompanyService;
    factoryService!: FactoryService;
    localSupplierService!: LocalSupplierService;
    shopService!: ShopService;

    constructor({
        supplyEntryRepository,
        wholesaleContractRepository,
        userIdentity,
    }: {
        supplyEntryRepository: SupplyEntryRepository;
        wholesaleContractRepository: WholesaleContractRepository;
        userIdentity: {};
    }) {
        this.supplyEntryRepository = supplyEntryRepository;
        this.wholesaleContractRepository = wholesaleContractRepository;
        this.userIdentity = userIdentity;
    }

    initialize({
        turnProgressSystem,
        companyService,
        factoryService,
        localSupplierService,
        shopService,
    }: {
        turnProgressSystem: TurnProgressSystem;
        companyService: CompanyService;
        factoryService: FactoryService;
        localSupplierService: LocalSupplierService;
        shopService: ShopService;
    }) {
        this.turnProgressSystem = turnProgressSystem;
        this.companyService = companyService;
        this.factoryService = factoryService;
        this.localSupplierService = localSupplierService;
        this.shopService = shopService;

        turnProgressSystem.registerCallback("wholesaleStep", this.progressTurn.bind(this));
    }

    /**
     * Register supply to the wholesale market so that it could be searched and contracted
     *
     * @param companyId
     * @param firmType
     * @param firmId
     * @param itemGroup
     * @param price
     * @param status
     * @throws ConflictException - SupplyEntry for given ItemGroup ${firmId} : ${itemGroupId} already exists
     */
    async registerSupply({
        companyId,
        firmType,
        firmId,
        itemGroup,
        price,
        status,
    }: {
        companyId: string;
        firmType: FirmType;
        firmId: string;
        itemGroup: ItemGroup;
        price: BigNumber;
        status: SupplyEntryStatus;
    }) {
        await this.throwIfItemGroupAlreadyRegistered(itemGroup.groupId, firmId);

        const newSupplyEntry = new SupplyEntry({
            companyId,
            firmType,
            firmId,
            productId: itemGroup.def.id,
            itemGroupId: itemGroup.groupId,
            stockAmount: itemGroup.amount,
            price,
            status,
        });
        return this.supplyEntryRepository.create(newSupplyEntry);
    }

    private async throwIfItemGroupAlreadyRegistered(itemGroupId: string, firmId: string) {
        const supplyEntryOfSameItemGroupQuery = await this.supplyEntryRepository.query({
            filter: [["itemGroupId", "=", itemGroupId]],
            limit: 0,
            showTotal: true,
        });
        if (supplyEntryOfSameItemGroupQuery.total > 0)
            throw new ConflictException({ reason: `SupplyEntry for given ItemGroup ${firmId} : ${itemGroupId} already exists` });
    }

    /**
     * Update supply data such as price
     *
     * @param id
     * @param price
     * @throws EntityNotFoundException
     */
    async updateSupply({ id, price }: { id: string; price: BigNumber }) {
        return this.supplyEntryRepository.update({ id, price });
    }

    /**
     * Get all SupplyEntries of firm
     *
     * @param firmId
     */
    async getSupplyEntriesOfFirm(firmId: string) {
        return this.supplyEntryRepository.query({ filter: [["firmId", "=", firmId]] });
    }

    /**
     * Search for suppliers to contract with
     */
    async querySuppliers(params: {
        filter?: (SupplyEntryFilterExpressions | EntityBasicFilterExpression)[];
        sort?: SortExpression<SupplyEntrySortableFields | EntityBasicSortableFields>[];
        limit?: number | null;
        offset?: number;
        showTotal?: boolean;
    }) {
        // TODO: Must restrict which filter can be used
        // TODO: Shouldn't let others see private SupplyEntries
        return this.supplyEntryRepository.query({ limit: null, ...params });
    }

    /**
     * Create wholesale contract between supply and buyer firm.
     *
     * @param supplyId
     * @param buyerCompanyId
     * @param buyerFirmType
     * @param buyerFirmId
     * @param amount
     * @param priceIncreaseLimit
     * @throws ConflictException - WholesaleContract for supply ${supplyId} and buyer firm ${firmId} already exists
     */
    async createContract({
        supplyId,
        buyerCompanyId,
        buyerFirmType,
        buyerFirmId,
        amount,
        priceIncreaseLimit,
    }: {
        supplyId: string;
        buyerCompanyId: string;
        buyerFirmType: FirmType;
        buyerFirmId: string;
        amount: BigNumber;
        priceIncreaseLimit?: BigNumber;
    }) {
        await this.throwIfSameContractExists(supplyId, buyerFirmId);

        // TODO: Optimization opportunity. Run promises concurrently.
        const supplyEntry = await this.supplyEntryRepository.read(supplyId);
        const newContract = WholesaleContract.createWithSupplyEntry({
            supplyEntry,
            buyerCompanyId,
            buyerFirmType,
            buyerFirmId,
            amount,
            priceIncreaseLimit,
        });
        return this.wholesaleContractRepository.create(newContract);
    }

    private async throwIfSameContractExists(supplyId: string, buyerFirmId: string) {
        const sameContractQuery = await this.wholesaleContractRepository.query({
            filter: [
                ["supplyEntryId", "=", supplyId],
                ["buyerFirmId", "=", buyerFirmId],
            ],
            limit: 0,
            showTotal: true,
        });

        if (sameContractQuery.total > 0)
            throw new ConflictException({
                reason: `WholesaleContract for supply ${supplyId} and buyer firm ${buyerFirmId} already exists`,
            });
    }

    /**
     * Get all contracts that given firm is the supplier.
     *
     * @param firmId
     */
    async getSupplyContractsOfFirm(firmId: string) {
        return this.wholesaleContractRepository.query({ filter: [["supplyFirmId", "=", firmId]], limit: null, showTotal: false });
    }

    /**
     * Get all contracts that given firm is the buyer.
     *
     * @param firmId
     */
    async getBuyContractsOfFirm(firmId: string) {
        return this.wholesaleContractRepository.query({ filter: [["buyerFirmId", "=", firmId]], limit: null, showTotal: false });
    }

    /**
     * For each supply, get its contracts.
     * Terminate any contract which needs to be terminated due to price increase
     * Evenly distribute supply to buyers
     * Update SupplyEntry's stockAmount
     */
    async progressTurn() {
        const supplyEntries = await this.supplyEntryRepository.query({
            filter: [["status", "!=", "closed"]],
            limit: null,
            showTotal: false,
        });

        supplyEntries.forEach((supplyEntry) => this.progressTurnForSupplyEntry(supplyEntry));
    }

    private async progressTurnForSupplyEntry(supplyEntry: SupplyEntry) {
        const supplyItemGroup = await this.getSupplyItemGroup(supplyEntry.firmType, supplyEntry.firmId, supplyEntry.itemGroupId);
        const contracts = await this.wholesaleContractRepository.query({
            filter: [
                ["supplyEntryId", "=", supplyEntry.id],
                ["status", "=", "active"],
            ],
            limit: null,
            showTotal: false,
        });
        const [activeContracts, terminatedContracts] = partition(
            contracts,
            (c) => c.startPrice.plus(c.priceIncreaseLimit) <= supplyEntry.price
        );
        await Promise.all(terminatedContracts.map((c) => this.wholesaleContractRepository.update({ id: c.id, status: "terminated" })));

        const remainderCount = await this.evenlyPerformItemSale(supplyEntry, supplyItemGroup, activeContracts);
        await this.supplyEntryRepository.update({ id: supplyEntry.id, stockAmount: remainderCount });
    }

    private async getSupplyItemGroup(firmType: FirmType, firmId: string, itemGroupId: string) {
        switch (firmType) {
            case "factory":
                return (await this.factoryService.getFactory(firmId)).storage.getItemGroup(itemGroupId);
            default:
                throw new UnexpectedError({
                    reason: `getSupplierItemGroup shouldn't have been called with the firm type.`,
                    data: { firmType, firmId },
                });
        }
    }

    // Sell items evenly as contract requests
    private async evenlyPerformItemSale(supplyEntry: SupplyEntry, supplyItemGroup: ItemGroup, contracts: WholesaleContract[]) {
        contracts.sort((a, b) => a.amount.comparedTo(b.amount));
        let amountLeft = supplyItemGroup.amount;
        let contractCount = contracts.length;
        let i = 0;
        for (; i < contracts.length; i++) {
            const contract = contracts[i];
            if (amountLeft.dividedToIntegerBy(contractCount).gt(contract.amount)) {
                await this.sellItemFromSupplierToBuyer(supplyEntry, contract, contract.amount);
                amountLeft = amountLeft.minus(contract.amount);
                contractCount--;
            } else break;
        }
        if (i > contracts.length)
            // All contracts are fully fulfilled. Supply was sufficient.
            return amountLeft;

        const distributedAmount = amountLeft.dividedToIntegerBy(contractCount);
        // TODO: Also sell remainder randomly. It might become a problem if item's amount is small, but there are many contracts.
        //  Also change return statement to return 0
        for (; i < contracts.length; i++) {
            const contract = contracts[i];
            await this.sellItemFromSupplierToBuyer(supplyEntry, contract, distributedAmount);
        }

        return amountLeft.mod(contractCount);
    }

    private async sellItemFromSupplierToBuyer(supplyEntry: SupplyEntry, contract: WholesaleContract, amount: BigNumber) {
        const totalPrice = supplyEntry.price.times(amount);
        const soldItem = await this.sellItemFromSupplier(
            supplyEntry.firmType,
            supplyEntry.firmId,
            supplyEntry.itemGroupId,
            amount,
            totalPrice
        );
        await this.sellItemToBuyer(contract.buyerFirmType, contract.buyerFirmId, soldItem, totalPrice);
    }

    private async sellItemFromSupplier(firmType: FirmType, firmId: string, itemGroupId: string, amount: BigNumber, totalPrice: BigNumber) {
        switch (firmType) {
            case "factory":
                return this.factoryService.sellItem({ factoryId: firmId, itemGroupId, amount, price: totalPrice });
            case "localSupplier":
                return this.localSupplierService.sellItem({ localSupplierId: firmId, itemGroupId, amount, price: totalPrice });
            default:
                throw new UnexpectedError({
                    reason: `sellItemFromSupplier shouldn't have been called with ${firmType} type firm ${firmId}`,
                });
        }
    }

    private async sellItemToBuyer(firmType: FirmType, firmId: string, item: ItemGroup, totalPrice: BigNumber) {
        switch (firmType) {
            case "factory":
                return this.factoryService.buyItem({ factoryId: firmId, itemGroup: item, price: totalPrice });
            case "shop":
                return this.shopService.buyItem({ shopId: firmId, itemGroup: item, price: totalPrice });
            default:
                throw new UnexpectedError({
                    reason: `sellItemFromSupplier shouldn't have been called with ${firmType} type firm ${firmId}`,
                });
        }
    }
}
