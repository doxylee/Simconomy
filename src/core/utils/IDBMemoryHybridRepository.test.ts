import { Entity } from "@core/common/entity";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { FE, FilterOperators } from "@core/common/repository";
import { beforeAll, describe, expect, it } from "@jest/globals";
import { ConflictException, EntityNotFoundException } from "@core/common/exceptions";
import BigNumber from "bignumber.js";
import { arrayWithTotal } from "@core/utils/arrayWithTotal";

class TestEntity extends Entity {
    entityType: "TestEntity" = "TestEntity";
    numberField: number;
    nullableStringField: string | null;
    bigNumberField: BigNumber | null;

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
    | FE<"id", "=", string>
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
        entities.forEach((e, i) => {
            e.numberField = i % 3;
            e.nullableStringField = [null, "a", "b", "c"][(i / 3) >> 0];
            e.bigNumberField = new BigNumber(5 - (i % 4) + "00000000000000000000000000000000000000000000000000000000000000000.1234567890");
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

            const bignumber = new BigNumber("300000000000000000000000000000000000000000000000000000000000000000.1234567890");
            await expect(repository.query({ filter: [["bigNumberField", ">=", bignumber]] })).resolves.toEqual(
                arrayWithTotal(
                    entities.filter((e) => (e.bigNumberField ?? 0) >= bignumber),
                    9
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

        it("correctly limit, offsets", async () => {
            await expect(repository.query({ limit: 4, offset: 2 })).resolves.toEqual(arrayWithTotal(entities.slice(2, 6), 12));

            await expect(repository.query({ limit: 4, offset: 2 })).resolves.toHaveProperty("total", 12);
            
            await expect(repository.query({ limit: 0, offset: 2 })).resolves.toEqual(arrayWithTotal([], 12));
            
            await expect(repository.query({ limit: null, offset: 2 })).resolves.toEqual(arrayWithTotal(entities.slice(2), 12));
        });

        it("returns total count depending on option", async () => {
            await expect(repository.query({ count: true })).resolves.toHaveProperty("total", 12);
            await expect(repository.query({ count: false })).resolves.not.toHaveProperty("total");
            await expect(repository.query()).resolves.toHaveProperty("total", 12);
        });
    });
});