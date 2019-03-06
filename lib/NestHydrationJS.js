'use strict';
var isArray = require('lodash.isarray');
var isFunction = require('lodash.isfunction');
var keys = require('lodash.keys');
var values = require('lodash.values');
var isPlainObject = require('lodash.isplainobject');
var NestHydrationJS;
(function (NestHydrationJS_1) {
    var NestHydrationJS = /** @class */ (function () {
        function NestHydrationJS() {
            this.typeHandlers = {
                NUMBER: function (cellValue) {
                    return parseFloat(cellValue);
                },
                BOOLEAN: function (cellValue) {
                    return cellValue == true;
                }
            };
            this.struct = null;
        }
        /* Creates a data structure containing nested objects and/or arrays from
         * tabular data based on a structure definition provided by
         * structPropToColumnMap. If structPropToColumnMap is not provided but
         * the data has column names that follow a particular convention then a
         * nested structures can also be created.
         */
        NestHydrationJS.prototype.nest = function (data, structPropToColumnMap) {
            var _this = this;
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
            if (!isArray(structPropToColumnMap) && !isPlainObject(structPropToColumnMap) && structPropToColumnMap !== null && structPropToColumnMap !== true) {
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
                throw Error('nest expects param data to be in the form of a plain object or an array of plain objects (forming a table)');
            }
            // structPropToColumnMap can be set to true as a tie break between
            // returning null (empty structure) or an empty list
            if (structPropToColumnMap === true) {
                listOnEmpty = true;
                structPropToColumnMap = null;
            }
            if (structPropToColumnMap === null && table.length > 0) {
                // property mapping not specified, determine it from column names
                // structPropToColumnMap = this.structPropToColumnMapFromColumnHints(keys(table[0]));
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
            var _nest = function (row, idColumn) {
                // Obj is the actual object that will end up in the final structure
                var obj;
                // Value here is really the id
                var value = row[idColumn];
                // only really concerned with the meta data for this identity column
                var objMeta = meta.idMap[idColumn];
                if (value === null) {
                    if (objMeta.default !== null && typeof objMeta.default !== 'undefined') {
                        value = objMeta.default;
                    }
                    else {
                        return;
                    }
                }
                // check if object already exists in cache
                if (typeof objMeta.cache[value] !== 'undefined') {
                    if (objMeta.containingIdUsage === null)
                        return;
                    // We know for certain that containing column is set if
                    // containingIdUsage is not null and can cast it as a string
                    // check and see if this has already been linked to the parent,
                    // and if so we don't need to continue
                    var containingId = row[objMeta.containingColumn];
                    if (typeof objMeta.containingIdUsage[value] !== 'undefined'
                        && typeof objMeta.containingIdUsage[value][containingId] !== 'undefined')
                        return;
                    // not already placed as to-many relation in container
                    obj = objMeta.cache[value];
                }
                else {
                    // don't have an object defined for this yet, create it and set the cache
                    obj = {};
                    objMeta.cache[value] = obj;
                    // copy in properties from table data
                    for (var k = 0; k < objMeta.valueList.length; k++) {
                        var cell = objMeta.valueList[k];
                        var cellValue = row[cell.column];
                        if (cellValue !== null) {
                            var valueTypeFunction = void 0;
                            if (isFunction(cell.type)) {
                                valueTypeFunction = cell.type;
                            }
                            else if (typeof cell.type === 'string') {
                                valueTypeFunction = _this.typeHandlers[cell.type];
                            }
                            if (valueTypeFunction) {
                                cellValue = valueTypeFunction(cellValue);
                            }
                        }
                        else if (typeof cell.default !== 'undefined') {
                            cellValue = cell.default;
                        }
                        obj[cell.prop] = cellValue;
                    }
                    // initialize empty to-many relations, they will be populated when
                    // those objects build themselves and find this containing object
                    for (var k = 0; k < objMeta.toManyPropList.length; k++) {
                        obj[objMeta.toManyPropList[k]] = [];
                    }
                    // initialize null to-one relations and then recursively build them
                    for (var k = 0; k < objMeta.toOneList.length; k++) {
                        obj[objMeta.toOneList[k].prop] = null;
                        _nest(row, objMeta.toOneList[k].column);
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
                    var containingId = row[objMeta.containingColumn];
                    var container = meta.idMap[objMeta.containingColumn].cache[containingId];
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
                    if (typeof (containingIdUsage)[value] === 'undefined') {
                        containingIdUsage[value] = {};
                    }
                    containingIdUsage[value][containingId] = true;
                }
            };
            // struct is populated inside the build function
            this.struct = null;
            for (var i = 0; i < table.length; i++) {
                // go through each row of the table
                var row = table[i];
                for (var j = 0; j < meta.primeIdColumnList.length; j++) {
                    // for each prime id column (corresponding to a to-many relation or
                    // the top level) attempted to build an object
                    var primeIdColumn = meta.primeIdColumnList[j];
                    _nest(row, primeIdColumn);
                }
            }
            return this.struct;
        };
        ;
        /* Create a data structure that contains lookups and cache spaces for quick
         * reference and action for the workings of the nest method.
         */
        NestHydrationJS.prototype.buildMeta = function (structPropToColumnMap) {
            var meta;
            // internally defines recursive function with extra param. This allows cleaner API		
            var _buildMeta = function (structPropToColumnMap, isOneOfMany, containingColumn, ownProp) {
                var idProp, subIdColumn;
                var idProps = [];
                var idColumns = [];
                var propList = keys(structPropToColumnMap);
                if (propList.length === 0) {
                    throw new Error('invalid structPropToColumnMap format - property \'' + ownProp + '\' can not be an empty array');
                }
                for (var i = 0; i < propList.length; i++) {
                    var prop = propList[i];
                    if (structPropToColumnMap[prop].id === true) {
                        idProp = prop;
                        idProps.push(prop);
                    }
                }
                if (idProp === undefined) {
                    idProp = propList[0];
                }
                // Force we can garuantee that it is a string now, so this will prevent the index error
                idProp = idProp;
                var idColumn = structPropToColumnMap[idProp].column || structPropToColumnMap[idProp];
                // idColumns = idProps.map(prop => structPropToColumnMap[idProp].column || structPropToColumnMap[idProp]);
                if (isOneOfMany) {
                    meta.primeIdColumnList.push(idColumn);
                }
                var objMeta = {
                    valueList: [],
                    toOneList: [],
                    toManyPropList: [],
                    containingColumn: containingColumn,
                    ownProp: ownProp,
                    isOneOfMany: isOneOfMany === true,
                    cache: {},
                    containingIdUsage: containingColumn === null ? null : {},
                    default: typeof structPropToColumnMap[idProp].default === 'undefined' ? null : structPropToColumnMap[idProp].default
                };
                for (var i = 0; i < propList.length; i++) {
                    var prop = propList[i];
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
                        objMeta.valueList.push({
                            prop: prop,
                            column: definitionColumn.column,
                            type: definitionColumn.type,
                            default: definitionColumn.default
                        });
                    }
                    else if (isArray(structPropToColumnMap[prop])) {
                        // list of objects / to-many relation
                        objMeta.toManyPropList.push(prop);
                        _buildMeta(structPropToColumnMap[prop][0], true, idColumn, prop);
                    }
                    else if (isPlainObject(structPropToColumnMap[prop])) {
                        // object / to-one relation
                        var subIdColumn_1 = values(structPropToColumnMap[prop])[0];
                        if (typeof subIdColumn_1 === 'undefined') {
                            throw new Error('invalid structPropToColumnMap format - property \'' + prop + '\' can not be an empty object');
                        }
                        if (subIdColumn_1.column) {
                            subIdColumn_1 = subIdColumn_1.column;
                        }
                        objMeta.toOneList.push({
                            prop: prop,
                            column: subIdColumn_1
                        });
                        _buildMeta(structPropToColumnMap[prop], false, idColumn, prop);
                    }
                    else {
                        throw new Error('invalid structPropToColumnMap format - property \'' + prop + '\' must be either a string, a plain object or an array');
                    }
                }
                meta.idMap[idColumn] = objMeta;
            };
            // this data structure is populated by the _buildMeta function
            meta = {
                primeIdColumnList: [],
                idMap: {}
            };
            if (isArray(structPropToColumnMap)) {
                if (structPropToColumnMap.length !== 1) {
                    throw new Error('invalid structPropToColumnMap format - can not have multiple roots for structPropToColumnMap, if an array it must only have one item');
                }
                // call with first object, but inform _buildMeta it is an array
                _buildMeta(structPropToColumnMap[0], true, null, null);
            }
            else if (isPlainObject(structPropToColumnMap)) {
                // register first column as prime id column
                var primeIdColumn = values(structPropToColumnMap)[0];
                if (typeof primeIdColumn === 'undefined') {
                    throw new Error('invalid structPropToColumnMap format - the base object can not be an empty object');
                }
                if (typeof primeIdColumn !== 'string') {
                    primeIdColumn = primeIdColumn.column;
                }
                meta.primeIdColumnList.push(primeIdColumn);
                // construct the rest
                _buildMeta(structPropToColumnMap, false, null, null);
            }
            return meta;
        };
        ;
        /* Returns a property mapping data structure based on the names of columns
         * in columnList. Used internally by nest when its propertyMapping param
         * is not specified.
         */
        // structPropToColumnMapFromColumnHints(columnList, renameMapping) {
        // 	var propertyMapping, prop, columnType, type, isId, column, pointer, navList, nav, renamedColumn, prevKeyList;
        // 	if (typeof renameMapping === 'undefined') {
        // 		renameMapping = {};
        // 	}
        // 	propertyMapping = {base: null};
        // 	for (let i = 0; i < columnList.length; i++) {
        // 		column = columnList[i];
        // 		columnType = column.split('___');
        // 		type = null;
        // 		isId = false;
        // 		for (let j = 1; j < columnType.length; j++) {
        // 			if (columnType[j] === 'ID') {
        // 				isId = true;
        // 			} else if (typeof NestHydrationJS.typeHandlers[columnType[j]] !== 'undefined') {
        // 				type = columnType[j];
        // 			}
        // 		}
        // 		pointer = propertyMapping; // point to base on each new column
        // 		prop = 'base';
        // 		navList = columnType[0].split('_');
        // 		for (let j = 0; j < navList.length; j++) {
        // 			nav = navList[j];
        // 			if (nav === '') {
        // 				if (pointer[prop] === null) {
        // 					pointer[prop] = [null];
        // 				}
        // 				pointer = pointer[prop];
        // 				prop = 0;
        // 			} else {
        // 				if (pointer[prop] === null) {
        // 					pointer[prop] = {};
        // 				}
        // 				if (typeof pointer[prop][nav] === 'undefined') {
        // 					renamedColumn = typeof renameMapping[column] === 'undefined'
        // 						? column
        // 						: renameMapping[column]
        // 					;
        // 					if (type !== null || isId) {
        // 						// no longer a simple mapping, has need of the type or id properties
        // 						renamedColumn = {column: renamedColumn};
        // 					}
        // 					if (type !== null) {
        // 						// detail the type in the column map if type provided
        // 						renamedColumn.type = type;
        // 					}
        // 					if (isId) {
        // 						// set the id property in the column map
        // 						renamedColumn.id = true;
        // 						// check for any existing id keys that are conflicting
        // 						prevKeyList = keys(pointer[prop]);
        // 						for (let k = 0; k < prevKeyList.length; k++) {
        // 							if (pointer[prop][prevKeyList[k]].id === true) {
        // 								return 'invalid - multiple id - ' + pointer[prop][prevKeyList[k]].column + ' and ' + renamedColumn.column + ' conflict';
        // 							}
        // 						}
        // 					}
        // 					pointer[prop][nav] = j === (navList.length - 1)
        // 						? renamedColumn // is leaf node, store full column string
        // 						: null // iteration will replace with object or array
        // 					;
        // 				}
        // 				pointer = pointer[prop];
        // 				prop = nav;
        // 			}
        // 		}
        // 	}
        // 	return propertyMapping.base;
        // };
        /* Registers a custom type handler */
        NestHydrationJS.prototype.registerType = function (name, handler) {
            if (this.typeHandlers[name]) {
                throw new Error('Handler with type, ' + name + ', already exists');
            }
            this.typeHandlers[name] = handler;
        };
        ;
        return NestHydrationJS;
    }());
    NestHydrationJS_1.NestHydrationJS = NestHydrationJS;
})(NestHydrationJS || (NestHydrationJS = {}));
// We have to wrap this in a function for backwards compatablity
module.exports = function () { return new NestHydrationJS.NestHydrationJS(); };
