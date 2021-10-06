class StructuredException {
    type: string = "StringifiableException";

    get message() {
        return this.type;
    }
}

export class EntityNotFoundException extends StructuredException {
    type: "EntityNotFoundException" = "EntityNotFoundException";
    entityType: string;
    entityId: string;

    constructor({ entityType, entityId }: { entityType: string; entityId: string }) {
        super();
        this.entityType = entityType;
        this.entityId = entityType;
    }
}

export class InvalidOperationException extends StructuredException {
    type: "InvalidOperationException" = "InvalidOperationException";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
    }
}

export class ConflictException extends StructuredException {
    type: "ConflictException" = "ConflictException";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
    }
}

export class UnexpectedError extends StructuredException {
    type: "UnexpectedError" = "UnexpectedError";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
    }
}

export type ServiceException = EntityNotFoundException | InvalidOperationException | ConflictException;
