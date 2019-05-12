declare namespace NestHydrationJS {
    type ITypeHandler = (cellValue: any) => any;
    interface IDictionary<TValue> {
        [index: string]: TValue;
    }
    interface IDefinitionColumn {
        column: string;
        id?: boolean;
        default?: any;
        type?: string;
        array?: boolean;
    }
    interface IDefinition {
        [index: string]: IDefinitionColumn | string | IDefinition | IDefinition[];
    }
    class NestHydrationJS {
        private typeHandlers;
        private struct;
        nest(data: any, structPropToColumnMap: IDefinition | IDefinition[] | null | boolean, verbose?: boolean): any;
        structPropToColumnMapFromColumnHints(columnList: string[], renameMapping?: IDictionary<string>): any;
        registerType(name: string, handler: ITypeHandler): void;
        private computeActualCellValue;
        private buildMeta;
    }
}
declare const _default: () => NestHydrationJS.NestHydrationJS;
export = _default;
