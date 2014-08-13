'use strict';

var NestHydrationJS, _;

_ = require('lodash');

NestHydrationJS = {};

NestHydrationJS.nest = function (data, structPropToColumnMap) {
	var listOnEmpty, columnList, table, lookup, struct, i, row, j, builder, primeIdColumn;
	
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
	
	lookup = NestHydrationJS.buildLookup(structPropToColumnMap);
	
	// BUILD FROM TABLE
	
	struct = null;
	
	builder = function (row, idColumn) {
		var value, objLookup, obj, k, containingId, container;
		
		value = row[idColumn];
		
		if (value === null) {
			// nothing to build
			return;
		}
		
		objLookup = lookup.idMap[idColumn];
		
		if (typeof objLookup.cache[value + ''] !== 'undefined') {
			// object already exists in cache
			if (objLookup.containingIdUsage === null) {
				// at the top level, parent is root
				return;
			}
			
			containingId = row[objLookup.containingColumn];
			if (typeof objLookup.containingIdUsage[containingId + ''] !== 'undefined') {
				// already placed as oneToMany relation in container, done
				return;
			}
			
			// not already placed as oneToMany relation in container
			obj = objLookup.cache[value + ''];
		} else {
			// don't have an object defined for this yet
			obj = {};
			objLookup.cache[value + ''] = obj;
			
			// copy in properties from table data
			for (k = 0; k < objLookup.valueList.length; k++) {
				obj[objLookup.valueList[k].prop] = row[objLookup.valueList[k].column];
			}
			
			for (k = 0; k < objLookup.oneToOneList.length; k++) {
				obj[objLookup.oneToOneList[k].prop] = null;
				builder(row, objLookup.oneToOneList[k].column);
			}
			
			for (k = 0; k < objLookup.oneToManyPropList.length; k++) {
				obj[objLookup.oneToManyPropList[k]] = [];
			}
		}
		
		// link from the parent
		if (objLookup.containingColumn === null) {
			// parent is the top level
			if (objLookup.isOneOfMany) {
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
			containingId = row[objLookup.containingColumn];
			container = lookup.idMap[objLookup.containingColumn].cache[containingId + ''];
			
			if (objLookup.isOneOfMany) {
				// it is an array
				container[objLookup.ownProp].push(obj);
			} else {
				// it is this object
				container[objLookup.ownProp] = obj;
			}
			
			// record the containing id
			objLookup.containingIdUsage[containingId + ''] = true;
		}
	};
	
	for (i = 0; i < table.length; i++) {
		row = table[i];
		
		for (j = 0; j < lookup.primeIdColumnList.length; j++) {
			primeIdColumn = lookup.primeIdColumnList[j];
			
			builder(row, primeIdColumn);
		}
	}
	
	return struct;
};

NestHydrationJS.buildLookup = function (structPropToColumnMap) {
	// internally defines recursive function with extra param. This allows cleaner API
	var lookup, propList;
	
	lookup = {
		primeIdColumnList: [],
		idMap: {}
	};
	
	var _buildLookup = function (structPropToColumnMap, lookup, isOneOfMany, containingColumn, ownProp) {
		var propList, idProp, idColumn, i, prop, objLookup, subIdColumn;
		
		propList = _.keys(structPropToColumnMap);
		idProp = propList[0];
		idColumn = structPropToColumnMap[idProp];
		
		if (isOneOfMany) {
			lookup.primeIdColumnList.push(idColumn);
		}
		
		objLookup = {
			valueList: [],
			oneToOneList: [],
			oneToManyPropList: [],
			containingColumn: null,
			ownProp: null,
			isOneOfMany: isOneOfMany === true,
			cache: {},
			containingIdUsage: null
		};
		
		if (typeof containingColumn != 'undefined' && typeof ownProp != 'undefined') {
			objLookup.containingColumn = containingColumn;
			objLookup.ownProp = ownProp;
			objLookup.containingIdUsage = {};
		}
		
		for (i = 0; i < propList.length; i++) {
			prop = propList[i];
			if (typeof structPropToColumnMap[prop] === 'string') {
				// value property
				objLookup.valueList.push({
					prop: prop,
					column: structPropToColumnMap[prop]
				});
			} else if (_.isArray(structPropToColumnMap[prop])) {
				// list of objects / one to many relation
				objLookup.oneToManyPropList.push(prop);
				
				_buildLookup(structPropToColumnMap[prop][0], lookup, true, idColumn, prop);
			} else {
				subIdColumn = _.values(structPropToColumnMap[prop])[0];
				
				// object / one to one relation
				objLookup.oneToOneList.push({
					prop: prop,
					column: subIdColumn
				});
				_buildLookup(structPropToColumnMap[prop], lookup, false, idColumn, prop);
			}
		}
		
		lookup.idMap[idColumn] = objLookup;
	};
	
	if (_.isArray(structPropToColumnMap)) {
		_buildLookup(structPropToColumnMap[0], lookup, true);
	} else {
		// register first column as prime id column
		propList = _.keys(structPropToColumnMap);
		lookup.primeIdColumnList.push(propList[0]);
		
		// construct the rest
		_buildLookup(structPropToColumnMap, lookup, false);
	}
	
	return lookup;
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
