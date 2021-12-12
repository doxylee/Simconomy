class StructuredException extends Error {
    name: string = "StructuredException";
    pureMessage?: string = undefined;
    data?: object = undefined;

    createMessage() {
        return `${this.pureMessage}${this.data ? ` \nData: ${JSON.stringify(this.data)}` : ""}`;
    }
}

export class EntityNotFoundException extends StructuredException {
    name: "EntityNotFoundException" = "EntityNotFoundException";
    entityType: string;
    entityId: string;

    constructor({ entityType, entityId }: { entityType: string; entityId: string }) {
        super();
        this.entityType = entityType;
        this.entityId = entityId;
        this.pureMessage = `Entity with id "${this.entityId}" of type ${this.entityType} is not found`;
        this.message = this.createMessage();
    }
}

export class InvalidOperationException extends StructuredException {
    name: "InvalidOperationException" = "InvalidOperationException";
    reason: string;

    constructor({ reason, data }: { reason: string; data?: object }) {
        super();
        this.reason = reason;
        this.pureMessage = `Invalid operation occurred. Reason: ${this.reason}`;
        this.data = data;
        this.message = this.createMessage();
    }
}

export class ConflictException extends StructuredException {
    name: "ConflictException" = "ConflictException";
    reason: string;

    constructor({ reason, data }: { reason: string; data?: object }) {
        super();
        this.reason = reason;
        this.pureMessage = `Conflict occurred. Reason: ${this.reason}`;
        this.data = data;
        this.message = this.createMessage();
    }
}

/**
 * Thrown if case that should never happen occurred
 */
export class UnexpectedError extends StructuredException {
    name: "UnexpectedError" = "UnexpectedError";
    reason: string;

    constructor({ reason, data }: { reason: string; data?: object }) {
        super();
        this.reason = reason;
        this.pureMessage = `Error that should never happen occurred! Reason: ${this.reason}`;
        this.data = data;
        this.message = this.createMessage();
    }
}

export type ServiceException = EntityNotFoundException | InvalidOperationException | ConflictException;

export function isServiceException(e: any): e is ServiceException {
    return ["EntityNotFoundException", "InvalidOperationException", "ConflictException"].includes(e.name);
}
