import {ICommonObject} from "types";
import { z } from 'zod';

/**
 * Convert schema to zod schema
 * @param {string | object} schema
 * @returns {ICommonObject}
 */
export const convertSchemaToZod = (schema: string | object):ICommonObject => {
        const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema
        const zodObj: ICommonObject = {}
        for (const sch of parsedSchema) {
            if (sch.type === 'string') {
                if (sch.required) z.string({required_error: `${sch.property} required`}).describe(sch.description)
                zodObj[sch.property] = z.string().describe(sch.description)
            } else if (sch.type === 'number') {
                if (sch.required) z.number({required_error: `${sch.property} required`}).describe(sch.description)
                zodObj[sch.property] = z.number().describe(sch.description)
            } else if (sch.type === 'boolean') {
                if (sch.required) z.boolean({required_error: `${sch.property} required`}).describe(sch.description)
                zodObj[sch.property] = z.boolean().describe(sch.description)
            }
        }
        return zodObj 
}