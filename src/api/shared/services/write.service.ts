// src/shared/services/write.service.ts
import {
    inferObjectSchema,
    validateObject,
    deepMerge,
    isPlainObject,
    ObjectSchema,
    ValidationError
} from "../utils/schema"

/** Fields the server owns: ignored when sent in a request body */
const SERVER_FIELDS = ["id", "createdAt"]

/** A field whose value must be the id of an existing record, e.g. products.categoryId → categories */
export interface ForeignKey {
    field: string
    entityName: string
    ids: Set<string>
}

export type WriteResult =
    | { ok: true; data: Record<string, any> }
    | { ok: false; status: 400 | 404 | 422; message: string; errors?: ValidationError[] }

/** Timestamps in the same format as the datasets: 2026-03-03T10:00:00Z */
const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z")

/**
 * The id a new record would get: the next number in the dataset's id pattern (`u25` → `u26`,
 * numeric `115` → `116`). Deterministic, since nothing is ever stored.
 */
export const nextId = (records: Record<string, any>[]): string | number => {
    const ids = records.map(r => r.id)
    if (ids.length > 0 && ids.every(id => typeof id === "number")) return Math.max(...ids) + 1

    const matches = ids.map(id => String(id).match(/^(.*?)(\d+)$/))
    const prefix = matches[0]?.[1]
    if (matches.length > 0 && matches.every(m => m && m[1] === prefix)) {
        return `${prefix}${Math.max(...matches.map(m => Number(m![2]))) + 1}`
    }
    return `${records.length + 1}`
}

/**
 * Fake writes (JSONPlaceholder-style): validates the request against a schema inferred from the
 * dataset and returns the record the write would produce. The dataset is never modified.
 */
export class WriteService {
    private schema: ObjectSchema
    private hasCreatedAt: boolean

    constructor(
        private records: Record<string, any>[],
        private entityName: string,
        private foreignKeys: ForeignKey[] = []
    ) {
        this.schema = inferObjectSchema(records)
        this.hasCreatedAt = this.schema.has("createdAt")
    }

    create(body: unknown): WriteResult {
        const input = this.parseBody(body)
        if (!input.ok) return input

        const errors = this.validate(input.data, false)
        if (errors.length > 0) return this.invalid(errors)

        return {
            ok: true,
            data: {
                id: nextId(this.records),
                ...input.data,
                ...(this.hasCreatedAt ? { createdAt: now() } : {})
            }
        }
    }

    replace(id: string, body: unknown): WriteResult {
        const existing = this.find(id)
        if (!existing) return this.notFound(id)

        const input = this.parseBody(body)
        if (!input.ok) return input

        const errors = this.validate(input.data, false)
        if (errors.length > 0) return this.invalid(errors)

        return {
            ok: true,
            data: {
                id: existing.id,
                ...input.data,
                ...(this.hasCreatedAt ? { createdAt: existing.createdAt } : {})
            }
        }
    }

    update(id: string, body: unknown): WriteResult {
        const existing = this.find(id)
        if (!existing) return this.notFound(id)

        const input = this.parseBody(body)
        if (!input.ok) return input

        const errors = this.validate(input.data, true)
        if (errors.length > 0) return this.invalid(errors)

        return { ok: true, data: deepMerge(existing, input.data) }
    }

    remove(id: string): WriteResult {
        const existing = this.find(id)
        return existing ? { ok: true, data: { ...existing } } : this.notFound(id)
    }

    private find(id: string) {
        return this.records.find(record => String(record.id) === id)
    }

    /** Requires a JSON object and drops server-owned fields */
    private parseBody(body: unknown): { ok: true; data: Record<string, any> } | WriteResult & { ok: false } {
        if (!isPlainObject(body)) {
            return {
                ok: false,
                status: 400,
                message: "Request body must be a JSON object (send it with Content-Type: application/json)"
            }
        }
        const data = { ...body }
        for (const field of SERVER_FIELDS) delete data[field]
        return { ok: true, data }
    }

    private validate(data: Record<string, any>, partial: boolean): ValidationError[] {
        const errors = validateObject(data, this.schema, { partial, skip: SERVER_FIELDS })

        for (const fk of this.foreignKeys) {
            const value = data[fk.field]
            if (value === undefined || value === null || errors.some(e => e.field === fk.field)) continue
            if (!fk.ids.has(String(value))) {
                errors.push({ field: fk.field, message: `no ${fk.entityName} record with id "${value}"` })
            }
        }
        return errors
    }

    private invalid(errors: ValidationError[]): WriteResult {
        return { ok: false, status: 422, message: "Validation failed", errors }
    }

    private notFound(id: string): WriteResult {
        return { ok: false, status: 404, message: `No ${this.entityName} record with id "${id}"` }
    }
}
