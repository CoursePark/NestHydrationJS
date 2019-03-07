declare module NestHydrationJS {
    interface TypeHandler {
        (cellValue: any): any;
    }
    interface Dictionary<TValue> {
        [index: string]: TValue;
    }
    interface DefinitionColumn {
        column: string;
        id?: boolean;
        default?: any;
        type?: string;
    }
    interface Definition {
        [index: string]: DefinitionColumn | string | Definition | Definition[];
    }
    class NestHydrationJS {
        private typeHandlers;
        private struct;
        nest(data: any, structPropToColumnMap: Definition | Definition[] | null | boolean): any;
        private buildMeta;
        structPropToColumnMapFromColumnHints(columnList: Array<string>, renameMapping?: Dictionary<string>): any;
        registerType(name: string, handler: TypeHandler): void;
    }
}
declare const _default: () => NestHydrationJS.NestHydrationJS;
export = _default;
