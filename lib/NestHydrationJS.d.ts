declare const isArray: any;
declare const isFunction: any;
declare const keys: any;
declare const values: any;
declare const isPlainObject: any;
declare module NestHydrationJS {
    interface TypeHandlers {
        [index: string]: TypeHandler;
    }
    interface TypeHandler {
        (cellValue: any): any;
    }
    interface MetaValueProps {
        prop: string;
        column: string;
        type?: string | TypeHandler;
        default?: any;
    }
    interface Dictionary<TValue> {
        [index: string]: TValue;
    }
    interface MetaColumnData {
        valueList: Array<MetaValueProps>;
        toOneList: Array<MetaValueProps>;
        toManyPropList: Array<string>;
        containingColumn: string | null;
        ownProp: string | null;
        isOneOfMany: boolean;
        cache: Dictionary<any>;
        containingIdUsage: Dictionary<Dictionary<boolean>> | null;
        default?: any;
    }
    interface MetaData {
        primeIdColumnList: Array<string>;
        idMap: {
            [index: string]: MetaColumnData;
        };
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
        typeHandlers: TypeHandlers;
        struct: object | Array<any> | null;
        nest(data: any, structPropToColumnMap: Definition | Definition[] | null | boolean): any;
        buildMeta(structPropToColumnMap: Definition | Definition[]): MetaData;
        registerType(name: string, handler: TypeHandler): void;
    }
}
