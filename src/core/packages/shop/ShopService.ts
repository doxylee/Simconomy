import { BigNumber } from "@core/common/BigNumber";
import { ShopRepository } from "@core/packages/shop/ShopRepository";
import { CompanyService } from "@core/packages/company/CompanyService";
import { TurnProgressSystem } from "@core/systems/TurnProgressSystem";
import { ItemStorage } from "@core/packages/item/ItemStorage";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { Shop } from "@core/packages/shop/Shop";
import { SaleEntry } from "@core/packages/shop/SaleEntry";
import { Service } from "@core/common/Service";

const SHOP_PRICE_PER_SIZE = 400000;
const SHOP_PRICE_PER_STORAGE_VOLUME = 1000;

export type SellingDataForCustomerMarket = {
    shopId: string;
    itemId: string;
    itemGroup: ItemGroup;
    size: BigNumber;
    price: BigNumber;
};

export class ShopService extends Service {
    repository: ShopRepository;
    userIdentity = {};

    turnProgressSystem!: TurnProgressSystem;
    companyService!: CompanyService;

    constructor({ repository, userIdentity }: { repository: ShopRepository; userIdentity: {} }) {
        super();
        this.repository = repository;
        this.userIdentity = userIdentity;
        this.bindMethods();
    }

    initialize({ turnProgressSystem, companyService }: { turnProgressSystem: TurnProgressSystem; companyService: CompanyService }) {
        this.turnProgressSystem = turnProgressSystem;
        this.companyService = companyService;
    }

    /**
     * Construct a new shop for the company.
     * Company should have enough cash to construct.
     *
     * @param companyId
     * @param size
     * @param storageVolume
     */
    async createShop({ companyId, size, storageVolume }: { companyId: string; size: BigNumber; storageVolume: BigNumber }) {
        // TODO: Don't construct shop, allow renting instead
        const newShop = new Shop({ companyId, size, storage: new ItemStorage({ maxVolume: storageVolume }) });
        const price = this.getShopConstructionPrice({ size, storageVolume });

        // Try to withdraw money from company
        await this.companyService.useCashOneTime({ id: companyId, amount: price });

        // Construct Factory if successful
        return await this.repository.create(newShop);

        // TODO: If shop construction fails, withdrawn cash should be returned to the company.
    }

    /**
     * Get price for constructing a new shop with given options.
     *
     * @param size
     * @param storageVolume
     */
    getShopConstructionPrice({ size, storageVolume }: { size: BigNumber; storageVolume: BigNumber }) {
        return size.times(SHOP_PRICE_PER_SIZE).plus(storageVolume.times(SHOP_PRICE_PER_STORAGE_VOLUME));
    }

    /**
     * Get shop entity by id
     * @param id
     * @throws EntityNotFoundException
     */
    async getShop(id: string) {
        return this.repository.read(id);
    }

    /**
     * Get all shops of a company.
     *
     * @param companyId
     */
    async getShopsOfCompany({ companyId }: { companyId: string }) {
        return this.repository.query({ filter: [["companyId", "=", companyId]], limit: null, showTotal: false });
    }

    /**
     * Change which items the shop sells.
     * WARNING: Signature might change
     *
     * @param shopId
     * @param selling - Array of SaleEntries to sell from the shop
     * @throws EntityNotFoundException
     */
    async setSelling({ shopId, selling }: { shopId: string; selling: SaleEntry[] }) {
        return this.repository.update({ id: shopId, selling });
        // TODO: Don't allow replacing selling entirely
        // TODO: Add validation
    }

    /**
     * Get list of all SaleEntry data augmented with data needed for RetailMarket turn progression.
     * Called from RetailMarketService.
     *
     * @throws EntityNotFoundException - Can't find ItemGroup designated in SaleEntry.
     */
    async getSellingDataForCustomerMarket(): Promise<SellingDataForCustomerMarket[]> {
        const allShops = await this.repository.query({ limit: null, showTotal: false });
        return allShops.flatMap((shop) =>
            shop.selling.map((selling) => ({
                shopId: shop.id,
                itemId: selling.itemId,
                itemGroup: shop.storage.getItemGroup(selling.itemGroupId),
                size: shop.size,
                price: selling.price,
            }))
        );
        // TODO: itemGroupId in SaleEntry must meet FK restriction.
    }

    /**
     * Shop buys contracted items.
     *
     * @param shopId
     * @param itemGroup
     * @param price
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - Volume of items is bigger than storage
     */
    async buyItem({ shopId, itemGroup, price }: { shopId: string; itemGroup: ItemGroup; price: BigNumber }) {
        // TODO: optionally designate itemGroupId
        const shop = await this.repository.read(shopId);
        shop.storage.addItemGroup(itemGroup);
        await this.repository.update(shop);
        // TODO: Optimization opportunity

        await this.companyService.useCashFixed({ id: shop.companyId, amount: price });
    }

    /**
     * Shop sells goods.
     *
     * @param shopId
     * @param itemGroupId
     * @param amount
     * @param totalPrice
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - Insufficient amount of items in ItemGroup
     */
    async sellItem({
        shopId,
        itemGroupId,
        amount,
        totalPrice,
    }: {
        shopId: string;
        itemGroupId: string;
        amount: BigNumber;
        totalPrice: BigNumber;
    }) {
        const shop = await this.repository.read(shopId);

        const items = shop.storage.takeItems({ itemGroupId, amount });
        await this.repository.update(shop);
        // TODO: Optimization opportunity

        await this.companyService.gainRevenue({ id: shop.companyId, amount: totalPrice });

        return items;
    }
}
