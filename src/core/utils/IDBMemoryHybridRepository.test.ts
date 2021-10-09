import { Entity } from "@core/common/entity";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { FE } from "@core/common/repository";
import { describe, expect, it } from "@jest/globals";
import { ConflictException, EntityNotFoundException } from "@core/common/exceptions";

class TestEntity extends Entity {
    entityType: "TestEntity" = "TestEntity";
    field1: string | null;
    field2: number;

    constructor({ field1 = null, field2 = 0, ...data }: Omit<Partial<TestEntity>, "entityType"> = {}) {
        super(data);
        this.field1 = field1;
        this.field2 = field2;
    }
}

class TestEntityRepository extends IDBMemoryHybridRepository<TestEntity, FE<"id", "=", string>, any> {
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
            const test_1_field1_val = "field_1_val";
            const test_1 = new TestEntity({ id: "test_1", field1: test_1_field1_val });
            await repository.create(test_1);

            const test_1_copy = await repository.read(test_1.id);
            expect(test_1_copy.field1).toEqual(test_1_field1_val);
            const test_1_field1_new_val = "new_field_1_val";
            test_1_copy.field1 = test_1_field1_new_val;
            await repository.update(test_1_copy);

            await expect(repository.read(test_1.id)).resolves.toEqual(
                expect.objectContaining({ id: test_1.id, field1: test_1_field1_new_val })
            );
            await expect(test_1.field1).toEqual(test_1_field1_val);
        });

        it("throws EntityNotFoundException if entity with id not exists", async () => {
            const repository = createTestRepository();
            const test_1_field1_val = "field_1_val";
            const test_1 = new TestEntity({ id: "test_1", field1: test_1_field1_val });
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
});