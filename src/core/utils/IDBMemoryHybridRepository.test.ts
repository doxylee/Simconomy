import { Entity } from "@core/common/entity";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { FE, FilterOperators } from "@core/common/repository";
import { beforeAll, describe, expect, it } from "@jest/globals";
import { ConflictException, EntityNotFoundException } from "@core/common/exceptions";
import { BigNumber, BN } from "@core/common/BigNumber";
import { arrayWithTotal } from "@core/utils/arrayWithTotal";
import { F } from "@core/common/F";

class TestEntity extends Entity {
    entityType: "TestEntity" = "TestEntity";
    numberField: number;
    nullableStringField: string | null;
    bigNumberField: BigNumber | null;

    // destructuring, and manually setting default values in the constructor
    // Default value assignment is done after calling super. so inputted value becomes overwritten with default values.

    constructor({
        numberField = 0,
        nullableStringField = null,
        bigNumberField = null,
        ...data
    }: Omit<Partial<TestEntity>, "entityType"> = {}) {
        super(data);
        this.numberField = numberField;
        this.nullableStringField = nullableStringField;
        this.bigNumberField = bigNumberField;
    }
}

type TestEntityFilterExpression =
    | FE<"numberField", FilterOperators, number>
    | FE<"nullableStringField", "=" | "!=", string | null>
    | FE<"bigNumberField", FilterOperators, BigNumber | null>;

type TestEntitySortableFields = "id" | "numberField" | "bigNumberField";

class TestEntityRepository extends IDBMemoryHybridRepository<TestEntity, TestEntityFilterExpression, TestEntitySortableFields> {
    entityType: "TestEntity" = "TestEntity";
}

function createTestRepository() {
    return new TestEntityRepository({ gameId: "testing" });
}

describe("IDBMemoryHybridRepository", () => {
    describe(".read", () => {
        it("returns entity with requested id", async () => {
            const repository = createTestRepository();
            const test_1 = new TestEntity({ id: "test_1" });
            await repository.create(test_1);

            await expect(repository.read(test_1.id)).resolves.toEqual(test_1);
        });

        it("throws EntityNotFoundException if entity with id not exist", async () => {
            const repository = createTestRepository();
            const test_1 = new TestEntity({ id: "test_1" });
            await repository.create(test_1);

            await expect(repository.read("unexisting_id")).rejects.toThrow(
                new EntityNotFoundException({
                    entityType: "TestEntity",
                    entityId: "unexisting_id",
                })
            );
        });
    });

    describe(".create", () => {
        it("stores cloned version of entity", async () => {
            const repository = createTestRepository();
            const test_1 = new TestEntity({ id: "test_1" });
            await repository.create(test_1);

            expect(repository.store[test_1.id]).not.toBe(test_1);
            expect(repository.store[test_1.id]).toEqual(test_1);
        });

        it("throws ConflictException if entity with same id already exists", async () => {
            const repository = createTestRepository();
            const test_1 = new TestEntity({ id: "test_1" });
            const test_1_copy = new TestEntity({ id: "test_1" });
            await repository.create(test_1);

            await expect(repository.create(test_1_copy)).rejects.toEqual(
                new ConflictException({ reason: "Entity with same id already exists." })
            );
        });
    });

    describe(".update", () => {
        it("updates the stored entity", async () => {
            const repository = createTestRepository();
            const test_1_numberField_val = 10;
            const test_1 = new TestEntity({ id: "test_1", numberField: test_1_numberField_val });
            await repository.create(test_1);

            const test_1_copy = await repository.read(test_1.id);
            expect(test_1_copy.numberField).toEqual(test_1_numberField_val);
            const test_1_numberField_new_val = 20;
            test_1_copy.numberField = test_1_numberField_new_val;
            await repository.update(test_1_copy);

            await expect(repository.read(test_1.id)).resolves.toEqual(
                expect.objectContaining({ id: test_1.id, numberField: test_1_numberField_new_val })
            );
            await expect(test_1.numberField).toEqual(test_1_numberField_val);
        });

        it("throws EntityNotFoundException if entity with id not exists", async () => {
            const repository = createTestRepository();
            const test_1_numberField_val = 10;
            const test_1 = new TestEntity({ id: "test_1", numberField: test_1_numberField_val });
            await repository.create(test_1);

            test_1.id = "new_id";

            await expect(repository.update(test_1)).rejects.toThrow(
                new EntityNotFoundException({
                    entityType: "TestEntity",
                    entityId: "new_id",
                })
            );
        });

        it("supports F expression", async () => {
            const repository = createTestRepository();
            const test_1_numberField_val = 10;
            const test_1 = new TestEntity({ id: "test_1", numberField: test_1_numberField_val });
            await repository.create(test_1);

            await expect(repository.update({ id: test_1.id, numberField: new F({ add: 10 }) })).resolves.toHaveProperty("numberField", 20);
        });

        it("supports F expression on BigNumber field", async () => {
            const repository = createTestRepository();
            const test_1_bigNumberField_val = BN(10);
            const test_1 = new TestEntity({ id: "test_1", bigNumberField: test_1_bigNumberField_val });
            await repository.create(test_1);

            await expect(
                repository.update({
                    id: test_1.id,
                    bigNumberField: new F({ add: BN(10) }),
                })
            ).resolves.toHaveProperty("bigNumberField", BN(20));
        });

        it("has race condition if F expression is not used", async () => {
            const repository = createTestRepository();
            const test_1_bigNumberField_val = BN(10);
            const test_1 = new TestEntity({ id: "test_1", bigNumberField: test_1_bigNumberField_val });
            await repository.create(test_1);

            const asyncAddToBigNumberField = async (i: number) => {
                const e = await repository.read(test_1.id);
                e.bigNumberField = e.bigNumberField?.plus(BN(i)) ?? null;
                await repository.update(e);
            };
            await Promise.all(new Array(10000).fill(1).map((i) => asyncAddToBigNumberField(i)));

            await expect(repository.read(test_1.id)).resolves.not.toHaveProperty("bigNumberField", BN(10010));
        });

        it("can avoid race condition with F expression", async () => {
            const repository = createTestRepository();
            const test_1_bigNumberField_val = BN(10);
            const test_1 = new TestEntity({ id: "test_1", bigNumberField: test_1_bigNumberField_val });
            await repository.create(test_1);

            const asyncAddToBigNumberField = async (i: number) => {
                await repository.update({ id: test_1.id, bigNumberField: new F({ add: BN(i) }) });
            };
            await Promise.all(new Array(10000).fill(1).map((i) => asyncAddToBigNumberField(i)));

            await expect(repository.read(test_1.id)).resolves.toHaveProperty("bigNumberField", BN(10010));
        });
    });

    describe(".delete", () => {
        it("deletes requested entity from storage", async () => {
            const repository = createTestRepository();
            const test_1 = new TestEntity({ id: "test_1" });
            await repository.create(test_1);
            await repository.delete(test_1.id);

            await expect(repository.read(test_1.id)).rejects.toThrow(
                new EntityNotFoundException({
                    entityType: "TestEntity",
                    entityId: test_1.id,
                })
            );
        });

        it("throws EntityNotFoundException if entity with id not exist", async () => {
            const repository = createTestRepository();

            await expect(repository.delete("unexisting_id")).rejects.toThrow(
                new EntityNotFoundException({
                    entityType: "TestEntity",
                    entityId: "unexisting_id",
                })
            );
        });
    });

    describe(".query", () => {
        const repository = createTestRepository();
        const entities = new Array(12).fill(null).map((x, idx) => new TestEntity({ id: idx.toString() }));
        const bigNumberGenPrefixes = [5, 4, 3, 2, 1, 50, 40, 30, 20, 10, 500, 400];
        entities.forEach((e, i) => {
            e.numberField = i % 3;
            e.nullableStringField = [null, "a", "b", "c"][(i / 3) >> 0];
            e.bigNumberField = BN(bigNumberGenPrefixes[i] + "00000000000000000000000000000000000000000000000000000000000000000.1234567890");
        });

        beforeAll(async () => {
            await Promise.all(entities.map((e) => repository.create(e)));
        });

        it("returns correctly filtered objects", async () => {
            await expect(repository.query({ filter: [["id", "=", "4"]] })).resolves.toEqual(arrayWithTotal([entities[4]], 1));

            await expect(repository.query({ filter: [["numberField", ">=", 1]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => e.numberField >= 1),
                    8
                )
            );

            await expect(repository.query({ filter: [["nullableStringField", "=", "a"]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => e.nullableStringField === "a"),
                    3
                )
            );

            await expect(repository.query({ filter: [["nullableStringField", "=", null]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => e.nullableStringField === null),
                    3
                )
            );
        });

        it("returns correctly filtered objects even if filtered by BigNumber fields", async () => {
            const bignumber = BN("300000000000000000000000000000000000000000000000000000000000000000.1234567890");

            await expect(repository.query({ filter: [["bigNumberField", ">=", bignumber]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => (e.bigNumberField ?? BN(0)).gte(bignumber)),
                    10
                )
            );

            await expect(repository.query({ filter: [["bigNumberField", "=", bignumber]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => (e.bigNumberField ?? BN(0)).eq(bignumber)),
                    1
                )
            );

            await expect(repository.query({ filter: [["bigNumberField", "!=", bignumber]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => !(e.bigNumberField ?? BN(0)).eq(bignumber)),
                    11
                )
            );
        });

        it("returns correctly sorted objects", async () => {
            await expect(repository.query({ sort: ["+id"] })).resolves.toEqual(
                arrayWithTotal([entities[0], entities[1], ...entities.slice(10, 12), ...entities.slice(2, 10)], 12)
            );

            await expect(repository.query({ sort: ["-id"] })).resolves.toEqual(
                arrayWithTotal([entities[0], entities[1], ...entities.slice(10, 12), ...entities.slice(2, 10)].reverse(), 12)
            );

            await expect(repository.query({ sort: ["numberField"] })).resolves.toEqual(
                arrayWithTotal(
                    entities.slice().sort((a, b) => a.numberField - b.numberField),
                    12
                )
            );
        });

        it("returns correctly sorted objects even if sorted by BigNumber fields", async () => {
            await expect(repository.query({ sort: ["bigNumberField"] })).resolves.toEqual(
                arrayWithTotal(
                    entities.slice().sort((a, b) => (a.bigNumberField ?? BN(-Infinity)).comparedTo(b.bigNumberField ?? BN(-Infinity))),
                    12
                )
            );
        });

        it("can sort by multiple fields", async () => {
            await expect(repository.query({ sort: ["numberField", "bigNumberField"] })).resolves.toEqual(
                arrayWithTotal(
                    entities.slice().sort((a, b) => {
                        if (a.numberField > b.numberField) return 1;
                        if (a.numberField < b.numberField) return -1;
                        return (a.bigNumberField ?? BN(-Infinity)).comparedTo(b.bigNumberField ?? BN(-Infinity));
                    }),
                    12
                )
            );
        });

        it("correctly limit, offsets", async () => {
            await expect(repository.query({ limit: 4, offset: 2 })).resolves.toEqual(arrayWithTotal(entities.slice(2, 6), 12));

            await expect(repository.query({ limit: 4, offset: 2 })).resolves.toHaveProperty("total", 12);

            await expect(repository.query({ limit: 0, offset: 2 })).resolves.toEqual(arrayWithTotal([], 12));

            await expect(repository.query({ limit: null, offset: 2 })).resolves.toEqual(arrayWithTotal(entities.slice(2), 12));
        });

        it("returns total count depending on option", async () => {
            await expect(repository.query({ showTotal: true })).resolves.toHaveProperty("total", 12);
            await expect(repository.query({ showTotal: false })).resolves.not.toHaveProperty("total");
            await expect(repository.query()).resolves.toHaveProperty("total", 12);
        });

        it("returns deepCloned entity", async () => {
            const entity1 = (await repository.query({ limit: 1 }))[0];
            const entity2 = (await repository.query({ limit: 1 }))[0];

            expect(entity1).toEqual(entity2);
            expect(entity1).not.toBe(entity2);
        });
    });
});
