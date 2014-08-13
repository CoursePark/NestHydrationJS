'use strict';

var NestHydrationJS, _;

_ = require('lodash');

NestHydrationJS = {};

/* Creates a data structure containing nested objects and/or arrays from
 * tabular data based on a structure definition provided by
 * structPropToColumnMap. If structPropToColumnMap is not provided but
 * the data has column names that follow a particular convention then nested
 * nested structures can also be created.
 */
NestHydrationJS.nest = function (data, structPropToColumnMap) {
	var listOnEmpty, columnList, table, meta, struct, i, row, j, _nest, primeIdColumn;
	
	// VALIDATE PARAMS AND BASIC INITIALIZATION
	
	listOnEmpty = false;
	columnList = null;
	
	if (typeof structPropToColumnMap === 'undefined') {
		structPropToColumnMap = null;
	}
	
	if (data === null) {
		return null;
	}
	
	if (!_.isArray(structPropToColumnMap) && !_.isPlainObject(structPropToColumnMap) && structPropToColumnMap !== null && structPropToColumnMap !== true) {
		throw 'nest expects param propertyMapping to be an array, plain object, null, or true';
	}
	
	// propertyMapping can be set to true as a tie break between
	// returning null (empty structure) or an empty list
	if (structPropToColumnMap === true) {
		listOnEmpty = true;
		structPropToColumnMap = null;
	} else if (_.isArray(structPropToColumnMap)) {
		listOnEmpty = true;
	}
	
	if (_.isPlainObject(data)) {
		// internal table should be a table format but a plain object
		// could be passed as the first (and only) row of that table
		table = [data];
	} else if (_.isArray(data)) {
		table = data;
	} else {
		throw 'nest expects param data to form an plain object or an array of plain objects (forming a table)';
	}
	
	if (structPropToColumnMap === null && table.length > 0) {
		// property mapping not specified, determine it from column names
		structPropToColumnMap = NestHydrationJS.structPropToColumnMapFromColumnHints(_.keys(table[0]));
	}
	
	if (structPropToColumnMap === null) {
		// properties is empty, can't form structure or determine content
		// for a list. Assume a structure unless listOnEmpty
		return listOnEmpty ? [] : null;
	} else if (table.length === 0) {
		// table is empty, return the appropriate empty result based on input definition
		return _.isArray(structPropToColumnMap) ? [] : null;
	}
	
	// COMPLETE VALIDATING PARAMS AND BASIC INITIALIZATION
	
	meta = NestHydrationJS.buildMeta(structPropToColumnMap);
	
	// BUILD FROM TABLE
	
	// defines function that can be called recursively
	_nest = function (row, idColumn) {
		var value, objMeta, obj, k, containingId, container;
		
		value = row[idColumn];
		
		if (value === null) {
			// nothing to build
			return;
		}
		
		// only really concerned with the meta data for this identity column
		objMeta = meta.idMap[idColumn];
		
		if (typeof objMeta.cache[value + ''] !== 'undefined') {
			// object already exists in cache
			if (objMeta.containingIdUsage === null) {
				// at the top level, parent is root
				return;
			}
			
			containingId = row[objMeta.containingColumn];
			if (typeof objMeta.containingIdUsage[containingId + ''] !== 'undefined') {
				// already placed as oneToMany relation in container, done
				return;
			}
			
			// not already placed as oneToMany relation in container
			obj = objMeta.cache[value + ''];
		} else {
			// don't have an object defined for this yet, create it
			obj = {};
			objMeta.cache[value + ''] = obj;
			
			// copy in properties from table data
			for (k = 0; k < objMeta.valueList.length; k++) {
				obj[objMeta.valueList[k].prop] = row[objMeta.valueList[k].column];
			}
			
			// intialize null to one relations and then recursively build them
			for (k = 0; k < objMeta.toOneList.length; k++) {
				obj[objMeta.toOneList[k].prop] = null;
				_nest(row, objMeta.toOneList[k].column);
			}
			
			// initialize empty to many relations, they will be populated when
			// those objects build themselve and find this containing object
			for (k = 0; k < objMeta.toManyPropList.length; k++) {
				obj[objMeta.toManyPropList[k]] = [];
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
			container = meta.idMap[objMeta.containingColumn].cache[containingId + ''];
			
			if (objMeta.isOneOfMany) {
				// it is an array
				container[objMeta.ownProp].push(obj);
			} else {
				// it is this object
				container[objMeta.ownProp] = obj;
			}
			
			// record the containing id
			objMeta.containingIdUsage[containingId + ''] = true;
		}
	};
	
	// struct is populated inside the build function
	struct = null;
	
	for (i = 0; i < table.length; i++) {
		// go through each row of the table
		row = table[i];
		
		for (j = 0; j < meta.primeIdColumnList.length; j++) {
			// for each prime id column (corresponding to a to many relation or
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
	var meta, propList, _buildMeta;
	
	// recursive internal function
	_buildMeta = function (structPropToColumnMap, isOneOfMany, containingColumn, ownProp) {
		var propList, idProp, idColumn, i, prop, objMeta, subIdColumn;
		
		propList = _.keys(structPropToColumnMap);
		idProp = propList[0];
		idColumn = structPropToColumnMap[idProp];
		
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
			containingIdUsage: containingColumn === null ? null : {}
		};
		
		for (i = 0; i < propList.length; i++) {
			prop = propList[i];
			if (typeof structPropToColumnMap[prop] === 'string') {
				// value property
				objMeta.valueList.push({
					prop: prop,
					column: structPropToColumnMap[prop]
				});
			} else if (_.isArray(structPropToColumnMap[prop])) {
				// list of objects / to many relation
				objMeta.toManyPropList.push(prop);
				
				_buildMeta(structPropToColumnMap[prop][0], true, idColumn, prop);
			} else {
				// object / to one relation
				subIdColumn = _.values(structPropToColumnMap[prop])[0];
				
				objMeta.toOneList.push({
					prop: prop,
					column: subIdColumn
				});
				_buildMeta(structPropToColumnMap[prop], false, idColumn, prop);
			}
		}
		
		meta.idMap[idColumn] = objMeta;
	};
	
	// this data structure is populated by the _buildMeta function
	meta = {
		primeIdColumnList: [],
		idMap: {}
	};
	
	if (_.isArray(structPropToColumnMap)) {
		// call with first object, but inform _buidMeta it is an array
		_buildMeta(structPropToColumnMap[0], true, null, null);
	} else {
		// register first column as prime id column
		propList = _.keys(structPropToColumnMap);
		meta.primeIdColumnList.push(propList[0]);
		
		// construct the rest
		_buildMeta(structPropToColumnMap, false, null, null);
	}
	
	return meta;
};

/* Returns a property mapping data structure based on the names of columns
 * in columnList. Used internally by nest when its propertyMapping param
 * is not specified.
 */
NestHydrationJS.structPropToColumnMapFromColumnHints = function (columnList) {
	var propertyMapping, prop, i, column, pointer, navList, j, nav;
	
	propertyMapping = {base: null};
	
	for (i = 0; i < columnList.length; i++) {
		column = columnList[i];
		
		pointer = propertyMapping; // point to base on each new column
		prop = 'base';
		
		navList = column.split('_');
		
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
					pointer[prop][nav] = j === (navList.length - 1)
						? column // is leaf node, store full column string
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

module.exports = NestHydrationJS;
