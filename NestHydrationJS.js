'use strict';

var NestHydrationJS, _;

_ = require('lodash');

NestHydrationJS = {};

NestHydrationJS.nest = function (table, propertyMapping) {
	var listOnEmpty, identityMapping, propertyListMap;
	
	listOnEmpty = false;
	
	if (propertyMapping == null) {
		propertyMapping = null;
	}
	
	if (table === null) {
		return null;
	}
	
	if (!_.isArray(table) && !_.isPlainObject(table)) {
		throw 'nest expects param table to be an array or plain object';
	}
	
	if (!_.isArray(propertyMapping) && propertyMapping !== null && propertyMapping !== true) {
		throw 'nest expects param propertyMapping to be an array, null, or true';
	}
	
	// propertyMapping can be set to true as a tie break between
	// returning null (empty structure) or an empty list
	if (propertyMapping === true) {
		listOnEmpty = true;
		propertyMapping = null;
	} else if (_.isArray(propertyMapping)) {
		listOnEmpty = true;
	}
	
	if (table.length === 0) {
		return listOnEmpty ? [] : null;
	}
	
	if (_.isPlainObject(table)) {
		// internal table should be a table format but a plaing object
		// could be passed as the first (and only) row of that table
		table = [table];
	}
	
	if (propertyMapping === null) {
		// property mapping not specified, determine it from column names
		propertyMapping = NestHydrationJS.propertyMappingFromColumnHints(_.keys(table[0]));
	}
	
	if (propertyMapping === null) {
		// properties is empty, can't form structure or determine content
		// for a list. Assume a structure unless listOnEmpty
		return listOnEmpty ? [] : null;
	}
	
	if (_.isArray(propertyMapping) && propertyMapping.length === 0) {
		// should return a list but don't know anything about the structure
		// of the items in the list, return empty list
		return [];
	}
	
	// precalculate identity columns before row processing, works by removing
	// columns that don't belong
	identityMapping = NestHydrationJS.filterToIdentityMapping(propertyMapping);
	
	// precalculate list of contained properties for each possible
	// structure, indexed by identity columns
	propertyListMap = NestHydrationJS.populatePropertyListMap(propertyMapping);
	
	// default is either an empty list or null structure
		// $structure = is_integer(key($propertyMapping)) ? array() : null;
	
	// initialize map for keys of identity columns to the nested structures
		// $mapByIndentityKeyToStruct = array();
	
	// row by row build up the data structure using the recursive
	// populate function.
		// foreach ($table as $row) {
		// 	static::populateStructure($structure, $row, $resultType, $propertyMapping, $identityMapping, $propertyListMap, $mapByIndentityKeyToStruct);
		// }
	
		// return $structure;
};

/* Creates identityMapping by filtering out non identity properties from
 * propertyMapping. Used by nest for efficient iteration.
 */
NestHydrationJS.identityMappingFilter = function (mapping) {
	var result, propertyList, firstProperty, property, i;
	
	if (_.isArray(mapping)) {
		if (mapping.length !== 1) {
			throw 'array property must have a single entry';
		}
		
		return [
			NestHydrationJS.identityMappingFilter(mapping[0])
		];
	}
	
	result = {};
	propertyList = _.keys(mapping);
	
	if (propertyList.length === 0) {
		throw 'must have at least one property';
	}
	
	// assumes the first entry is the identity entry
	firstProperty = propertyList.shift();
	if (typeof mapping[firstProperty] !== 'string') {
		throw 'first property must be an identity property string, not an object nor an array';
	}
	result[firstProperty] = mapping[firstProperty];
	
	// filter the rest or dive
	for (i = 0; i < propertyList.length; i++) {
		property = propertyList[i];
		if (typeof mapping[property] === 'string') {
			continue;
		}
		result[property] = NestHydrationJS.identityMappingFilter(mapping[property]);
	}
	
	return result;
};

/* Create a list of non identity properties by identity column. Used by nest
 * for efficient iteration.
 */
NestHydrationJS.populatePropertyListMap = function (mapping) {
	var propertyListMap, propertyList, identityColumn, i, property, column, childPLM, childIdentityColumn;
	
	if (_.isArray(mapping)) {
		if (mapping.length !== 1) {
			throw 'array property must have a single entry';
		}
		
		return NestHydrationJS.populatePropertyListMap(mapping[0]);
	}
	
	propertyListMap = {};
	
	propertyList = _.keys(mapping);
	
	if (propertyList.length === 0) {
		throw 'must have at least one property';
	}
	
	identityColumn = mapping[propertyList[0]];
	
	for (i = 0; i < propertyList.length; i++) {
		property = propertyList[i];
		
		column = mapping[property];
		
		if (typeof column === 'string') {
			if (typeof propertyListMap[identityColumn] === 'undefined') {
				propertyListMap[identityColumn] = [];
			}
			propertyListMap[identityColumn].push(property);
		} else {
			// OPTIMIZATION IDEA: This code progressivily copies the contents
			// of childPLM outwards for each depth of recursion, could instead
			// pass in flat destination structure and operate directly on it.
			// This would be a fairly minor optimization because this code is
			// only executed once per query and the depth of nesting, the
			// number of columns nested are seldom significant
			childPLM = NestHydrationJS.populatePropertyListMap(column);
			
			for (childIdentityColumn in childPLM) {
				if (typeof propertyListMap[childIdentityColumn] === 'undefined') {
					propertyListMap[childIdentityColumn] = [];
				}
				propertyListMap[childIdentityColumn] = propertyListMap[childIdentityColumn]
					.concat(childPLM[childIdentityColumn])
				;
			}
		}
	}
	
	return propertyListMap;
};

/* Returns a property mapping data structure based on the names of columns
 * in columnList. Used internally by nest when its propertyMapping param
 * is not specified.
 */
NestHydrationJS.propertyMappingFromColumnHints = function (columnList) {
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
