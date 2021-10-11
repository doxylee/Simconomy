import { CompanyRepository } from "@core/packages/company/CompanyRepository";
import BigNumber from "bignumber.js";
import { Company } from "@core/packages/company/Company";
import { InvalidOperationException } from "@core/common/exceptions";
import { F } from "@core/common/F";

export class CompanyService {
    repository: CompanyRepository;
    userIdentity = {};

    constructor(repository: CompanyRepository, userIdentity = {}) {
        this.repository = repository;
        this.userIdentity = userIdentity;
    }

    /**
     * Create a new company
     * @param name - Name of the company
     * @param cash - Initial cash
     */
    async createCompany({ name, cash = new BigNumber(0) }: { name: string; cash: BigNumber }) {
        const newCompany = new Company({ name, cash });
        return this.repository.create(newCompany);
    }

    /**
     * Get company entity by id
     * @param id
     * @throws EntityNotFoundException
     */
    async getCompany({ id }: { id: string }) {
        return this.repository.read(id);
    }

    /**
     * Expend cash from company.
     * Only works if remaining cash is sufficient.
     * WARNING: Negative cash balance might occur if called many times concurrently.
     *
     * @param id
     * @param amount - Amount of cash to expend.
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - When remaining cash is insufficient
     */
    async useCashOneTime({ id, amount }: { id: string; amount: BigNumber }) {
        const company = await this.repository.read(id);
        if (amount > company.cash) throw new InvalidOperationException({ reason: "Not enough cash" });
        return this.repository.update({ id, cash: new F({ add: amount.negated() }) });
    }

    /**
     * Expend fixed cashflow from company.
     * Also works even if remaining cash is insufficient.
     * Remaining cash becomes negative if it happens.
     * Must check remaining cash after this to handle bankruptcy.
     *
     * @param id
     * @param amount - Amount of cash to expend.
     * @throws EntityNotFoundException
     */
    async useCashFixed({ id, amount }: { id: string; amount: BigNumber }) {
        return this.repository.update({ id, cash: new F({ add: amount.negated() }) });
    }

    /**
     * Add revenue to company.
     *
     * @param id
     * @param amount - Amount of cash to add as revenue.
     * @throws EntityNotFoundException
     */
    async gainRevenue({ id, amount }: { id: string; amount: BigNumber }) {
        return this.repository.update({ id, cash: new F({ add: amount }) });
    }
}