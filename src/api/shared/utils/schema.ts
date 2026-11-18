// src/shared/utils/schema.ts
// Infers a record schema from a dataset so the fake write endpoints can validate request bodies
// without hand-written schemas. A new dataset is validated automatically.

export type JsonType = "string" | "number" | "boolean" | "object" | "array" | "null"

export interface FieldSchema {
    /** Every JSON type seen for this field */
    types: Set<JsonType>
    /** Present and non-null in every record */
    required: boolean
    /** Sub-fields, when the field holds objects */
    properties?: ObjectSchema
    /** Element schema, when the field holds arrays (undefined if every array was empty) */
    items?: FieldSchema
}

export type ObjectSchema = Map<string, FieldSchema>

export interface ValidationError {
    field: string
    message: string
}

export const jsonType = (value: unknown): JsonType =>
    value === null ? "null" : Array.isArray(value) ? "array" : (typeof value as JsonType)

export const isPlainObject = (value: unknown): value is Record<string, any> =>
    jsonType(value) === "object"

const inferValues = (values: unknown[]): Omit<FieldSchema, "required"> => {
    const schema: Omit<FieldSchema, "required"> = { types: new Set(values.map(jsonType)) }

    const objects = values.filter(isPlainObject)
    if (objects.length > 0) schema.properties = inferObjectSchema(objects)

    const elements = values.filter(Array.isArray).flat()
    if (elements.length > 0) schema.items = { ...inferValues(elements), required: true }

    return schema
}

/** Schema for a list of records: the union of their fields */
export const inferObjectSchema = (records: Record<string, any>[]): ObjectSchema => {
    const keys = new Set(records.flatMap(record => Object.keys(record)))
    const schema: ObjectSchema = new Map()
    for (const key of keys) {
        const present = records.filter(record => Object.prototype.hasOwnProperty.call(record, key))
        const values = present.map(record => record[key])
        schema.set(key, {
            ...inferValues(values),
            required: present.length === records.length && values.every(v => v !== null)
        })
    }
    return schema
}

const describeTypes = (types: Set<JsonType>) => {
    const names = [...types].map(t => (t === "object" || t === "array" ? `an ${t}` : t === "null" ? "null" : `a ${t}`))
    return names.join(" or ")
}

const validateValue = (value: unknown, field: FieldSchema, path: string, partial: boolean): ValidationError[] => {
    const type = jsonType(value)
    if (!field.types.has(type)) return [{ field: path, message: `must be ${describeTypes(field.types)}` }]

    if (type === "object" && field.properties) {
        return validateObject(value as Record<string, any>, field.properties, { partial, prefix: `${path}.` })
    }
    if (type === "array" && field.items) {
        // Array elements are always validated in full: arrays are replaced, never merged
        return (value as unknown[]).flatMap((el, i) => validateValue(el, field.items!, `${path}[${i}]`, false))
    }
    return []
}

/**
 * Validates an object against a schema.
 * - `partial` (PATCH): only the fields that are present are checked, and nested objects may be partial too
 * - otherwise (POST/PUT): required fields must be present
 * Unknown fields are always rejected. `skip` lists top-level fields to leave out of the required check.
 */
export const validateObject = (
    obj: Record<string, any>,
    schema: ObjectSchema,
    { partial = false, prefix = "", skip = [] as string[] } = {}
): ValidationError[] => {
    const errors: ValidationError[] = []

    for (const [key, value] of Object.entries(obj)) {
        const field = schema.get(key)
        if (!field) {
            errors.push({ field: `${prefix}${key}`, message: "is not a known field" })
            continue
        }
        errors.push(...validateValue(value, field, `${prefix}${key}`, partial))
    }

    if (!partial) {
        for (const [key, field] of schema) {
            if (field.required && !skip.includes(key) && !Object.prototype.hasOwnProperty.call(obj, key)) {
                errors.push({ field: `${prefix}${key}`, message: "is required" })
            }
        }
    }

    return errors
}

/** JSON merge for PATCH: nested plain objects merge, everything else (arrays included) replaces */
export const deepMerge = (target: Record<string, any>, patch: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = { ...target }
    for (const [key, value] of Object.entries(patch)) {
        if (key === "__proto__") continue
        result[key] = isPlainObject(value) && isPlainObject(target[key]) ? deepMerge(target[key], value) : value
    }
    return result
}
