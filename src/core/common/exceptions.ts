class StructuredException extends Error {
    name: string = "StructuredException";
}

export class EntityNotFoundException extends StructuredException {
    name: "EntityNotFoundException" = "EntityNotFoundException";
    entityType: string;
    entityId: string;

    constructor({ entityType, entityId }: { entityType: string; entityId: string }) {
        super();
        this.entityType = entityType;
        this.entityId = entityId;
        this.message = `Entity with id "${this.entityId}" of type ${this.entityType} is not found`;
    }
}

export class InvalidOperationException extends StructuredException {
    name: "InvalidOperationException" = "InvalidOperationException";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
        this.message = `Invalid operation occurred. Reason: ${this.reason}`;
    }
}

export class ConflictException extends StructuredException {
    name: "ConflictException" = "ConflictException";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
        this.message = `Conflict occurred. Reason: ${this.reason}`;
    }
}

/**
 * Thrown if case that should never happen occurred
 */
export class UnexpectedError extends StructuredException {
    name: "UnexpectedError" = "UnexpectedError";
    reason: string;

    constructor({ reason }: { reason: string }) {
        super();
        this.reason = reason;
        this.message = `Error that should never happen occurred! Reason: ${this.reason}`;
    }
}

export type ServiceException = EntityNotFoundException | InvalidOperationException | ConflictException;

export function isServiceException(e: any): e is ServiceException {
    return ["EntityNotFoundException", "InvalidOperationException", "ConflictException"].includes(e.name);
}
