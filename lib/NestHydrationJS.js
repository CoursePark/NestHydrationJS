'use strict';
var isArray = require("lodash.isarray");
var isFunction = require("lodash.isfunction");
var isPlainObject = require("lodash.isplainobject");
var keys = require("lodash.keys");
var values = require("lodash.values");
// tslint:disable-next-line: no-namespace
var NestHydrationJS;
(function (NestHydrationJS_1) {
    function createCompositeKey(vals, separator) {
        if (separator === void 0) { separator = ', '; }
        return vals.join(separator);
    }
    // tslint:disable-next-line: no-shadowed-variable
    var NestHydrationJS = /** @class */ (function () {
        function NestHydrationJS() {
            this.typeHandlers = {
                NUMBER: function (cellValue) {
                    return parseFloat(cellValue);
                },
                BOOLEAN: function (cellValue) {
                    // tslint:disable-next-line: triple-equals
                    return cellValue == true;
                },
            };
            this.struct = null;
        }
        /* Creates a data structure containing nested objects and/or arrays from
         * tabular data based on a structure definition provided by
         * structPropToColumnMap. If structPropToColumnMap is not provided but
         * the data has column names that follow a particular convention then a
         * nested structures can also be created.
         */
        NestHydrationJS.prototype.nest = function (data, structPropToColumnMap, verbose) {
            var _this = this;
            if (verbose === void 0) { verbose = false; }
            var table;
            // VALIDATE PARAMS AND BASIC INITIALIZATION
            // Determines that on no results, and empty list is used instead of null. // NOTE: fact check this
            var listOnEmpty = false;
            if (typeof structPropToColumnMap === 'undefined') {
                structPropToColumnMap = null;
            }
            if (data === null) {
                return null;
            }
            if (!isArray(structPropToColumnMap) && !isPlainObject(structPropToColumnMap) &&
                structPropToColumnMap !== null && structPropToColumnMap !== true) {
                throw new Error('nest expects param structPropToColumnMap to be an array, plain object, null, or true');
            }
            if (isPlainObject(data)) {
                // internal table should be a table format but a plain object
                // could be passed as the first (and only) row of that table
                table = [data];
            }
            else if (isArray(data)) {
                table = data;
            }
            else {
                // tslint:disable-next-line: max-line-length
                throw Error("nest expects param data to be in the form of a plain object or an array of plain objects (forming a table)");
            }
            // structPropToColumnMap can be set to true as a tie break between
            // returning null (empty structure) or an empty list
            if (structPropToColumnMap === true) {
                listOnEmpty = true;
                structPropToColumnMap = null;
            }
            if (structPropToColumnMap === null && table.length > 0) {
                // property mapping not specified, determine it from column names
                structPropToColumnMap = this.structPropToColumnMapFromColumnHints(keys(table[0]));
            }
            if (structPropToColumnMap === null) {
                // properties is empty, can't form structure or determine content
                // for a list. Assume a structure unless listOnEmpty
                return listOnEmpty ? [] : null;
            }
            else if (table.length === 0) {
                // table is empty, return the appropriate empty result based on input definition
                return isArray(structPropToColumnMap) ? [] : null;
            }
            // COMPLETE VALIDATING PARAMS AND BASIC INITIALIZATION
            var meta = this.buildMeta(structPropToColumnMap);
            // BUILD FROM TABLE
            // defines function that can be called recursively
            var recursiveNest = function (row, idColumns) {
                // Obj is the actual object that will end up in the final structure
                var obj;
                // Get all of the values for each id
                var vals = idColumns.map(function (column) { return row[column]; });
                // only really concerned with the meta data for this identity column
                var objMeta = meta.idMap[createCompositeKey(idColumns)];
                // If any of the values are null, we'll check and see if we need to set defaults
                vals = vals.map(function (value, idx) {
                    if (value === null) {
                        if (objMeta.defaults[idColumns[idx]] !== null && typeof objMeta.defaults[idColumns[idx]] !== 'undefined') {
                            return objMeta.defaults[idColumns[idx]];
                        }
                    }
                    return value;
                });
                if (vals.indexOf(null) !== -1) {
                    return;
                }
                // check if object already exists in cache
                if (typeof objMeta.cache[createCompositeKey(vals)] !== 'undefined') {
                    // not already placed as to-many relation in container
                    obj = objMeta.cache[createCompositeKey(vals)];
                    // Add array values if necessary
                    for (var _i = 0, _a = objMeta.arraysList; _i < _a.length; _i++) {
                        var prop = _a[_i];
                        var cellValue = _this.computeActualCellValue(prop, row[prop.column]);
                        if (isArray(obj[prop.prop])) {
                            obj[prop.prop].push(cellValue);
                        }
                        else {
                            obj[prop.prop] = [cellValue];
                        }
                    }
                    if (objMeta.containingIdUsage === null) {
                        return;
                    }
                    // We know for certain that containing column is set if
                    // containingIdUsage is not null and can cast it as a string
                    // check and see if this has already been linked to the parent,
                    // and if so we don't need to continue
                    var containingIds = objMeta.containingColumn.map(function (column) { return row[column]; });
                    if (typeof objMeta.containingIdUsage[createCompositeKey(vals)] !== 'undefined'
                        && typeof objMeta.containingIdUsage[createCompositeKey(vals)][createCompositeKey(containingIds)] !== 'undefined') {
                        return;
                    }
                }
                else {
                    // don't have an object defined for this yet, create it and set the cache
                    obj = {};
                    objMeta.cache[createCompositeKey(vals)] = obj;
                    // copy in properties from table data
                    for (var _b = 0, _c = objMeta.valueList; _b < _c.length; _b++) {
                        var prop = _c[_b];
                        var cellValue = _this.computeActualCellValue(prop, row[prop.column]);
                        obj[prop.prop] = cellValue;
                    }
                    // Add array values
                    for (var _d = 0, _e = objMeta.arraysList; _d < _e.length; _d++) {
                        var prop = _e[_d];
                        var cellValue = _this.computeActualCellValue(prop, row[prop.column]);
                        if (isArray(obj[prop.prop])) {
                            obj[prop.prop].push(cellValue);
                        }
                        else {
                            obj[prop.prop] = [cellValue];
                        }
                    }
                    // initialize empty to-many relations, they will be populated when
                    // those objects build themselves and find this containing object
                    for (var _f = 0, _g = objMeta.toManyPropList; _f < _g.length; _f++) {
                        var prop = _g[_f];
                        obj[prop] = [];
                    }
                    // initialize null to-one relations and then recursively build them
                    for (var _h = 0, _j = objMeta.toOneList; _h < _j.length; _h++) {
                        var prop = _j[_h];
                        obj[prop.prop] = null;
                        recursiveNest(row, Array.isArray(prop.column) ? prop.column : [prop.column]);
                    }
                }
                // link from the parent
                if (objMeta.containingColumn === null) {
                    // parent is the top level
                    if (objMeta.isOneOfMany) {
                        // it is an array
                        if (_this.struct === null) {
                            _this.struct = [];
                        }
                        _this.struct.push(obj);
                    }
                    else {
                        // it is this object
                        _this.struct = obj;
                    }
                }
                else {
                    var containingIds = objMeta.containingColumn.map(function (column) { return row[column]; });
                    var container = meta.idMap[createCompositeKey(objMeta.containingColumn)]
                        .cache[createCompositeKey(containingIds)];
                    // If a container exists, it must not be a root, and thus there should
                    // be an ownProp set
                    if (container) {
                        if (objMeta.isOneOfMany) {
                            // it is an array
                            container[objMeta.ownProp].push(obj);
                        }
                        else {
                            // it is this object
                            container[objMeta.ownProp] = obj;
                        }
                    }
                    // record the containing id so we don't do this again (return in earlier
                    // part of this method)
                    var containingIdUsage = objMeta.containingIdUsage;
                    if (typeof (containingIdUsage)[createCompositeKey(vals)] === 'undefined') {
                        containingIdUsage[createCompositeKey(vals)] = {};
                    }
                    containingIdUsage[createCompositeKey(vals)][createCompositeKey(containingIds)] = true;
                }
            };
            // struct is populated inside the build function
            this.struct = null;
            // tslint:disable-next-line: no-console
            if (verbose) {
                console.log(meta);
            }
            for (var _i = 0, table_1 = table; _i < table_1.length; _i++) {
                var row = table_1[_i];
                for (var _a = 0, _b = meta.primeIdColumnList; _a < _b.length; _a++) {
                    var primeIdColumn = _b[_a];
                    // for each prime id column (corresponding to a to-many relation or
                    // the top level) attempted to build an object
                    recursiveNest(row, primeIdColumn);
                }
            }
            return this.struct;
        };
        /* Returns a property mapping data structure based on the names of columns
         * in columnList. Used internally by nest when its propertyMapping param
         * is not specified.
         *
         */
        NestHydrationJS.prototype.structPropToColumnMapFromColumnHints = function (columnList, renameMapping) {
            if (typeof renameMapping === 'undefined') {
                renameMapping = {};
            }
            var propertyMapping = { base: null };
            for (var _i = 0, columnList_1 = columnList; _i < columnList_1.length; _i++) {
                var column = columnList_1[_i];
                var columnType = column.split('___');
                var type = null;
                var idFlagSet = false;
                var arrayFlagSet = false;
                for (var j = 1; j < columnType.length; j++) {
                    if (columnType[j] === 'ID') {
                        idFlagSet = true;
                    }
                    else if (typeof this.typeHandlers[columnType[j]] !== 'undefined') {
                        type = columnType[j];
                    }
                    if (columnType[j] === 'ARRAY') {
                        arrayFlagSet = true;
                    }
                }
                var pointer = propertyMapping; // point to base on each new column
                var prop = 'base';
                var navList = columnType[0].split('_');
                for (var j = 0; j < navList.length; j++) {
                    var nav = navList[j];
                    if (nav === '') {
                        if (pointer[prop] === null) {
                            pointer[prop] = [null];
                        }
                        pointer = pointer[prop];
                        prop = 0;
                    }
                    else {
                        if (pointer[prop] === null) {
                            pointer[prop] = {};
                        }
                        if (typeof pointer[prop][nav] === 'undefined') {
                            var renamedColumn = typeof renameMapping[column] === 'undefined'
                                ? column
                                : renameMapping[column];
                            if (type !== null || idFlagSet || arrayFlagSet) {
                                // no longer a simple mapping, has need of the type or id properties
                                renamedColumn = { column: renamedColumn };
                            }
                            if (type !== null) {
                                // detail the type in the column map if type provided
                                renamedColumn.type = type;
                            }
                            if (idFlagSet) {
                                // set the id property in the column map
                                renamedColumn.id = true;
                            }
                            if (arrayFlagSet) {
                                renamedColumn.array = true;
                            }
                            pointer[prop][nav] = j === (navList.length - 1)
                                ? renamedColumn // is leaf node, store full column string
                                : null // iteration will replace with object or array
                            ;
                        }
                        pointer = pointer[prop];
                        prop = nav;
                    }
                }
            }
            return propertyMapping.base;
        };
        /* Registers a custom type handler */
        NestHydrationJS.prototype.registerType = function (name, handler) {
            if (this.typeHandlers[name]) {
                throw new Error('Handler with type, ' + name + ', already exists');
            }
            this.typeHandlers[name] = handler;
        };
        NestHydrationJS.prototype.computeActualCellValue = function (props, initialValue) {
            var cellValue = initialValue;
            if (cellValue !== null) {
                var valueTypeFunction = void 0;
                if (isFunction(props.type)) {
                    valueTypeFunction = props.type;
                }
                else if (typeof props.type === 'string') {
                    valueTypeFunction = this.typeHandlers[props.type];
                }
                if (valueTypeFunction) {
                    cellValue = valueTypeFunction(cellValue);
                }
            }
            else if (typeof props.default !== 'undefined') {
                cellValue = props.default;
            }
            return cellValue;
        };
        /* Create a data structure that contains lookups and cache spaces for quick
         * reference and action for the workings of the nest method.
         */
        NestHydrationJS.prototype.buildMeta = function (structPropToColumnMap) {
            var meta;
            // internally defines recursive function with extra param. This allows cleaner API
            var recursiveBuildMeta = function (
            // tslint:disable-next-line: no-shadowed-variable
            structPropToColumnMap, isOneOfMany, containingColumn, ownProp) {
                var idProps = [];
                var idColumns = [];
                var propList = keys(structPropToColumnMap);
                if (propList.length === 0) {
                    throw new Error('invalid structPropToColumnMap format - property \'' + ownProp + '\' can not be an empty array');
                }
                // Add all of the columns flagged as id to the array
                for (var _i = 0, propList_1 = propList; _i < propList_1.length; _i++) {
                    var prop = propList_1[_i];
                    if (structPropToColumnMap[prop].id === true) {
                        idProps.push(prop);
                    }
                }
                // If no columns are flagged as id, then use the first value in the prop list
                if (idProps.length === 0) {
                    idProps.push(propList[0]);
                }
                idColumns = idProps.map(function (prop) {
                    return structPropToColumnMap[prop].column || structPropToColumnMap[prop];
                });
                if (isOneOfMany) {
                    meta.primeIdColumnList.push(idColumns);
                }
                var defaults = {};
                idProps.forEach(function (prop) {
                    defaults[prop] = typeof structPropToColumnMap[prop].default === 'undefined' ?
                        null :
                        structPropToColumnMap[prop].default;
                });
                var objMeta = {
                    valueList: [],
                    toOneList: [],
                    arraysList: [],
                    toManyPropList: [],
                    containingColumn: containingColumn,
                    ownProp: ownProp,
                    isOneOfMany: isOneOfMany === true,
                    cache: {},
                    containingIdUsage: containingColumn === null ? null : {},
                    defaults: defaults,
                };
                for (var _a = 0, propList_2 = propList; _a < propList_2.length; _a++) {
                    var prop = propList_2[_a];
                    if (typeof structPropToColumnMap[prop] === 'string') {
                        // value property
                        objMeta.valueList.push({
                            prop: prop,
                            column: structPropToColumnMap[prop],
                            type: undefined,
                            default: undefined
                        });
                    }
                    else if (structPropToColumnMap[prop].column) {
                        // value property
                        var definitionColumn = structPropToColumnMap[prop];
                        var metaValueProps = {
                            prop: prop,
                            column: definitionColumn.column,
                            type: definitionColumn.type,
                            default: definitionColumn.default,
                        };
                        // Add this column to our array list if necessary
                        if (definitionColumn.array === true) {
                            objMeta.arraysList.push(metaValueProps);
                        }
                        else {
                            objMeta.valueList.push(metaValueProps);
                        }
                    }
                    else if (isArray(structPropToColumnMap[prop])) {
                        // list of objects / to-many relation
                        objMeta.toManyPropList.push(prop);
                        recursiveBuildMeta(structPropToColumnMap[prop][0], true, idColumns, prop);
                    }
                    else if (isPlainObject(structPropToColumnMap[prop])) {
                        // object / to-one relation
                        var subIdProps = [];
                        for (var _b = 0, _c = values(structPropToColumnMap[prop]); _b < _c.length; _b++) {
                            var value = _c[_b];
                            if (typeof value === 'object' && value.id === true) {
                                subIdProps.push(value.column);
                            }
                        }
                        // If no columns are flagged as id, then use the first value in the prop list
                        if (subIdProps.length === 0) {
                            var column = values(structPropToColumnMap[prop])[0];
                            subIdProps.push(typeof column === 'object' ? column.column : column);
                        }
                        objMeta.toOneList.push({
                            prop: prop,
                            column: subIdProps,
                        });
                        recursiveBuildMeta(structPropToColumnMap[prop], false, idColumns, prop);
                    }
                    else {
                        throw new Error('invalid structPropToColumnMap format - property \'' + prop +
                            '\' must be either a string, a plain object or an array');
                    }
                }
                meta.idMap[createCompositeKey(idColumns)] = objMeta;
            };
            // this data structure is populated by the _buildMeta function
            meta = {
                primeIdColumnList: [],
                idMap: {},
            };
            if (isArray(structPropToColumnMap)) {
                if (structPropToColumnMap.length !== 1) {
                    // tslint:disable-next-line: max-line-length
                    throw new Error("invalid structPropToColumnMap format - can not have multiple roots for structPropToColumnMap, if an array it must only have one item");
                }
                // call with first object, but inform _buildMeta it is an array
                recursiveBuildMeta(structPropToColumnMap[0], true, null, null);
            }
            else if (isPlainObject(structPropToColumnMap)) {
                // register first column as prime id column
                var columns = values(structPropToColumnMap);
                if (columns.length === 0) {
                    throw new Error('invalid structPropToColumnMap format - the base object can not be an empty object');
                }
                // First determine if there are any keys set on the columns
                var idColumns = columns.reduce(function (accumulator, column) {
                    if (column.id === true) {
                        accumulator.push(column.column);
                    }
                    return accumulator;
                }, []);
                // If there were no keys set, then take the first column as the id
                if (idColumns.length === 0) {
                    if (typeof columns[0] === 'string') {
                        idColumns.push(columns[0]);
                    }
                    else if (typeof columns[0].column === 'string') {
                        idColumns.push(columns[0].column);
                    }
                }
                meta.primeIdColumnList.push(idColumns);
                // construct the rest
                recursiveBuildMeta(structPropToColumnMap, false, null, null);
            }
            return meta;
        };
        return NestHydrationJS;
    }());
    NestHydrationJS_1.NestHydrationJS = NestHydrationJS;
})(NestHydrationJS || (NestHydrationJS = {}));
module.exports = function generate() { return new NestHydrationJS.NestHydrationJS(); };
//# sourceMappingURL=NestHydrationJS.js.map