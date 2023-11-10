import { FromSchema } from "json-schema-to-ts";

import { recordSchema } from "../schemas/record";

export type Record = FromSchema<typeof recordSchema>;
