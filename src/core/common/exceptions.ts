class StructuredException extends Error {
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
        this.entityId = entityId;
    }

    get message() {
        return `Entity with id "${this.entityId}" of type ${this.entityType} is not found`;
    }
}

export class InvalidOperationException extends StructuredException {
    type: "InvalidOperationException" = "InvalidOperationException";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
    }

    get message() {
        return `Invalid operation occurred. Reason: ${this.reason}`;
    }
}

export class ConflictException extends StructuredException {
    type: "ConflictException" = "ConflictException";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
    }
    
    get message() {
        return `Conflict occurred. Reason: ${this.reason}`;
    }
}

/**
 * Thrown if case that should never happen occurred
 */
export class UnexpectedError extends StructuredException {
    type: "UnexpectedError" = "UnexpectedError";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
    }
    
    get message() {
        return `Error that should never happen occurred! Reason: ${this.reason}`;
    }
}

export type ServiceException = EntityNotFoundException | InvalidOperationException | ConflictException;
