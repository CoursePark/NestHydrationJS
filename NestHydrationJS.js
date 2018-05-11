'use strict';

function nestHydrationJS() {
	var NestHydrationJS, _;

	var isArray = require('lodash.isarray');
	var isFunction = require('lodash.isfunction');
	var keys = require('lodash.keys');
	var values = require('lodash.values');
	var isPlainObject = require('lodash.isplainobject');

	NestHydrationJS = {};
	
	NestHydrationJS.typeHandlers = {
		NUMBER: function (cellValue) {
			return parseFloat(cellValue);
		},
		BOOLEAN: function (cellValue) {
			return cellValue == true;
		}
	};
	
	/* Creates a data structure containing nested objects and/or arrays from
	 * tabular data based on a structure definition provided by
	 * structPropToColumnMap. If structPropToColumnMap is not provided but
	 * the data has column names that follow a particular convention then a
	 * nested structures can also be created.
	 */
	NestHydrationJS.nest = function (data, structPropToColumnMap) {
		var listOnEmpty, table, meta, struct, i, row, j, _nest, primeIdColumn;
		
		// VALIDATE PARAMS AND BASIC INITIALIZATION
		
		listOnEmpty = false;
		
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
		} else if (isArray(data)) {
			table = data;
		} else {
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
			structPropToColumnMap = NestHydrationJS.structPropToColumnMapFromColumnHints(keys(table[0]));
		}
		
		if (structPropToColumnMap === null) {
			// properties is empty, can't form structure or determine content
			// for a list. Assume a structure unless listOnEmpty
			return listOnEmpty ? [] : null;
		} else if (table.length === 0) {
			// table is empty, return the appropriate empty result based on input definition
			return isArray(structPropToColumnMap) ? [] : null;
		}
		
		// COMPLETE VALIDATING PARAMS AND BASIC INITIALIZATION
		
		meta = NestHydrationJS.buildMeta(structPropToColumnMap);
		
		// BUILD FROM TABLE
		
		// defines function that can be called recursively
		_nest = function (row, idColumn) {
			var value, objMeta, obj, k, containingId, container, cell, cellValue, valueTypeFunction;
			
			value = row[idColumn];
			
			// only really concerned with the meta data for this identity column
			objMeta = meta.idMap[idColumn];
			
			if (value === null) {
				if (objMeta.default !== null && typeof objMeta.default !== 'undefined') {
					value = objMeta.default;
				} else {
					return;
				}
			}
			
			if (typeof objMeta.cache[value] !== 'undefined') {
				// object already exists in cache
				if (objMeta.containingIdUsage === null) {
					// at the top level, parent is root
					return;
				}
				
				containingId = row[objMeta.containingColumn];
				if (typeof objMeta.containingIdUsage[value] !== 'undefined'
					&& typeof objMeta.containingIdUsage[value][containingId] !== 'undefined'
				) {
					// already placed as to-many relation in container, done
					return;
				}
				
				// not already placed as to-many relation in container
				obj = objMeta.cache[value];
			} else {
				// don't have an object defined for this yet, create it
				obj = {};
				objMeta.cache[value] = obj;
				
				// copy in properties from table data
				for (k = 0; k < objMeta.valueList.length; k++) {
					cell = objMeta.valueList[k];
					cellValue = row[cell.column];
					if (cellValue !== null) {
						if (isFunction(cell.type)) {
							valueTypeFunction = cell.type;
						} else {
							valueTypeFunction = NestHydrationJS.typeHandlers[cell.type];
						}
						if (valueTypeFunction) {
							cellValue = valueTypeFunction(cellValue, cell.column, row);
						}
					} else if (typeof cell.default !== 'undefined') {
						cellValue = cell.default;
					}
					
					obj[cell.prop] = cellValue;
				}
				
				// initialize empty to-many relations, they will be populated when
				// those objects build themselves and find this containing object
				for (k = 0; k < objMeta.toManyPropList.length; k++) {
					obj[objMeta.toManyPropList[k]] = [];
				}
				
				// initialize null to-one relations and then recursively build them
				for (k = 0; k < objMeta.toOneList.length; k++) {
					obj[objMeta.toOneList[k].prop] = null;
					_nest(row, objMeta.toOneList[k].column);
				}
			}
			
			// link from the parent
			if (objMeta.containingColumn === null) {
				// parent is the top level
				if (objMeta.isOneOfMany) {
					// it is an array
					if (struct === null) {
						struct = [];
					}
					struct.push(obj);
				} else {
					// it is this object
					struct = obj;
				}
			} else {
				containingId = row[objMeta.containingColumn];
				container = meta.idMap[objMeta.containingColumn].cache[containingId];

				if (container) {
					if (objMeta.isOneOfMany) {
						// it is an array
						container[objMeta.ownProp].push(obj);
					} else {
						// it is this object
						container[objMeta.ownProp] = obj;
					}
				}
				
				// record the containing id
				if (typeof objMeta.containingIdUsage[value] === 'undefined') {
					objMeta.containingIdUsage[value] = {};
				}
				objMeta.containingIdUsage[value][containingId] = true;
			}
		};
		
		// struct is populated inside the build function
		struct = null;
		
		for (i = 0; i < table.length; i++) {
			// go through each row of the table
			row = table[i];
			
			for (j = 0; j < meta.primeIdColumnList.length; j++) {
				// for each prime id column (corresponding to a to-many relation or
				// the top level) attempted to build an object
				primeIdColumn = meta.primeIdColumnList[j];
				
				_nest(row, primeIdColumn);
			}
		}
		
		return struct;
	};
	
	/* Create a data structure that contains lookups and cache spaces for quick
	 * reference and action for the workings of the nest method.
	 */
	NestHydrationJS.buildMeta = function (structPropToColumnMap) {
		// internally defines recursive function with extra param. This allows cleaner API
		var meta, _buildMeta, primeIdColumn;
		
		// recursive internal function
		_buildMeta = function (structPropToColumnMap, isOneOfMany, containingColumn, ownProp) {
			var propList, idProp, idColumn, i, prop, objMeta, subIdColumn;
			
			
			propList = keys(structPropToColumnMap);
			if (propList.length === 0) {
				throw new Error('invalid structPropToColumnMap format - property \'' + ownProp + '\' can not be an empty array');
			}
			
			for (i = 0; i < propList.length; i++) {
				prop = propList[i];
				if (structPropToColumnMap[prop].id === true) {
					idProp = prop;
					break;
				}
			}
			
			if (idProp === undefined) {
				idProp = propList[0];
			}
			
			idColumn = structPropToColumnMap[idProp].column || structPropToColumnMap[idProp];
			
			if (isOneOfMany) {
				meta.primeIdColumnList.push(idColumn);
			}
			
			objMeta = {
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
			
			for (i = 0; i < propList.length; i++) {
				prop = propList[i];
				if (typeof structPropToColumnMap[prop] === 'string') {
					// value property
					objMeta.valueList.push({
						prop: prop,
						column: structPropToColumnMap[prop],
						type: undefined,
						default: undefined
					});
				} else if (structPropToColumnMap[prop].column) {
					// value property
					objMeta.valueList.push({
						prop: prop,
						column: structPropToColumnMap[prop].column,
						type: structPropToColumnMap[prop].type,
						default: structPropToColumnMap[prop].default
					});
				} else if (isArray(structPropToColumnMap[prop])) {
					// list of objects / to-many relation
					objMeta.toManyPropList.push(prop);
					
					_buildMeta(structPropToColumnMap[prop][0], true, idColumn, prop);
				} else if (isPlainObject(structPropToColumnMap[prop])) {
					// object / to-one relation
					
					subIdColumn = values(structPropToColumnMap[prop])[0];
					if (typeof subIdColumn === 'undefined') {
						throw new Error('invalid structPropToColumnMap format - property \'' + prop + '\' can not be an empty object');
					}
					
					if (subIdColumn.column) {
						subIdColumn = subIdColumn.column;
					}
					
					objMeta.toOneList.push({
						prop: prop,
						column: subIdColumn
					});
					_buildMeta(structPropToColumnMap[prop], false, idColumn, prop);
				} else {
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
		} else if (isPlainObject(structPropToColumnMap)) {
			// register first column as prime id column
			primeIdColumn = values(structPropToColumnMap)[0];
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
	
	/* Returns a property mapping data structure based on the names of columns
	 * in columnList. Used internally by nest when its propertyMapping param
	 * is not specified.
	 */
	NestHydrationJS.structPropToColumnMapFromColumnHints = function (columnList, renameMapping) {
		var propertyMapping, prop, i, columnType, type, isId, column, pointer, navList, j, nav, renamedColumn, prevKeyList, k;
		
		if (typeof renameMapping === 'undefined') {
			renameMapping = {};
		}
		
		propertyMapping = {base: null};
		
		for (i = 0; i < columnList.length; i++) {
			column = columnList[i];
			
			columnType = column.split('___');
			
			type = null;
			isId = false;
			for (j = 1; j < columnType.length; j++) {
				if (columnType[j] === 'ID') {
					isId = true;
				} else if (typeof NestHydrationJS.typeHandlers[columnType[j]] !== 'undefined') {
					type = columnType[j];
				}
			}
			
			pointer = propertyMapping; // point to base on each new column
			prop = 'base';
			
			navList = columnType[0].split('_');
			
			for (j = 0; j < navList.length; j++) {
				nav = navList[j];
				
				if (nav === '') {
					if (pointer[prop] === null) {
						pointer[prop] = [null];
					}
					pointer = pointer[prop];
					prop = 0;
				} else {
					if (pointer[prop] === null) {
						pointer[prop] = {};
					}
					if (typeof pointer[prop][nav] === 'undefined') {
						renamedColumn = typeof renameMapping[column] === 'undefined'
							? column
							: renameMapping[column]
						;
						if (type !== null || isId) {
							// no longer a simple mapping, has need of the type or id properties
							renamedColumn = {column: renamedColumn};
						}
						if (type !== null) {
							// detail the type in the column map if type provided
							renamedColumn.type = type;
						}
						if (isId) {
							// set the id property in the column map
							renamedColumn.id = true;
							// check for any existing id keys that are conflicting
							prevKeyList = keys(pointer[prop]);
							for (k = 0; k < prevKeyList.length; k++) {
								if (pointer[prop][prevKeyList[k]].id === true) {
									return 'invalid - multiple id - ' + pointer[prop][prevKeyList[k]].column + ' and ' + renamedColumn.column + ' conflict';
								}
							}
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
	NestHydrationJS.registerType = function (name, handler) {
		if (NestHydrationJS.typeHandlers[name]) {
			throw new Error('Handler with type, ' + name + ', already exists');
		}
		
		NestHydrationJS.typeHandlers[name] = handler;
	};
	return NestHydrationJS;
}
module.exports = nestHydrationJS;
