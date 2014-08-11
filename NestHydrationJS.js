'use strict';

var NestHydrationJS, _;

_ = require('lodash');

NestHydrationJS = {};

NestHydrationJS.nest = function (table, propertyMapping) {
	var listOnEmpty, identityMapping, idColToPropList, i;
	
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
	idColToPropList = NestHydrationJS.identityColumnToPropertyList(propertyMapping);
	
	// default is either an empty list or null structure
	structure = _.isArray(propertyMapping) ? [] : null;
	
	// initialize map for keys of identity columns to the nested structures
	mapByIndentityKeyToStruct = [];
	
	// row by row build up the data structure using the recursive
	// populate function
	for (i = 0; i < table.length; i++) {
		NestHydrationJS.populateStructure(structure, table[i], propertyMapping, identityMapping, idColToPropList, mapByIndentityKeyToStruct);
	}
	
	return structure;
};

/* Populate structure with row data based propertyMapping with useful hints
 * coming from diff, identityMapping and idColToPropList
 */
NestHydrationJS.populateStructure = function (structure, row, propertyMapping, identityMapping, idColToPropList, mapByIndentityKeyToStruct) {
	var propertyList, identityColumn, pos, i, property;
	
	if (_.isArray(identityMapping)) {
		// list of nested structures
		
		// identity column of the array sub structure is the first property
		propertyList = _.keys(identityMapping[0]);
		identityColumn = identityMapping[0][propertyList[0]];
		
		if (row[identityColumn] === null) {
			// structure is empty
			structure = []; // OPTIMIZATION IDEA: I think this line is removable, [] is by places that call populateStructure
			return;
		}
		
		i = 'i' + row[identityColumn];
		if (typeof mapByIndentityKeyToStruct[i] === 'undefined') {
			structure.push([]);
			pos = structure.length - 1;
			
			// store structure identity key for quick reference if needed later
			mapByIndentityKeyToStruct[i] = [pos, {}];
		} else {
			// structure has already been started, further changes would
			// be nested in deeper structure, get the position in the
			// list of existing structure
			pos = mapByIndentityKeyToStruct[i][0];
		}
		
		// populate the structure in the list
		NestHydrationJS.populateStructure(structure[pos], row, propertyMapping[0], identityMapping[0], idColToPropList, mapByIndentityKeyToStruct[i][1]);
		return;
	}
	
	// not a list, so a structure
	
	// get the identity column and property, move identity mapping along
	identityPropertyList = _.keys(identityMapping);
	identityProperty = identityPropertyList[0];
	identityColumn = identityMapping[identityProperty];
	
	if (row[identityColumn] === null) {
		// the identity column null, the structure doesn't exist
		return;
	}
	
	if (structure === null) {
		structure = {};
	}
	
	// go through properties for structure and copy from row
	for (i = 0; i < idColToPropList[identityColumn].length; i++) {
		property = idColToPropList[identityColumn][i];
		
		structure[property] = row[propertyMapping[property]];
	}
	
	// go through the nested structures remaining in identityMapping
	for (i = 0; i < identityPropertyList.length; i++) {
		property = identityPropertyList[i];
		
		if (typeof structure[property] === 'undefined') {
			// nested structure doesn't already exist, initialize
			structure[property] = _.isArray(identityMapping[property]) ? [] : null;
			mapByIndentityKeyToStruct[property] = _.isArray(identityMapping[property]) ? [] : {};
		}
		
		// go into the nested structure
		NestHydrationJS.populateStructure(structure[property], row, propertyMapping[property], identityMapping[property], idColToPropList, mapByIndentityKeyToStruct[property]);
	}
};

/* Creates identityMapping by filtering out non identity properties from
 * propertyMapping. Used by nest for efficient iteration.
 */
NestHydrationJS.identityMapping = function (mapping) {
	var result, propertyList, firstProperty, property, i;
	
	if (_.isArray(mapping)) {
		if (mapping.length !== 1) {
			throw 'array property must have a single entry';
		}
		
		return [
			NestHydrationJS.identityMapping(mapping[0])
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
		result[property] = NestHydrationJS.identityMapping(mapping[property]);
	}
	
	return result;
};

/* Create a list of non identity properties by identity column. Used by nest
 * for efficient iteration.
 */
NestHydrationJS.identityColumnToPropertyList = function (mapping) {
	var idColToPropList, propertyList, identityColumn, i, property, column, childPLM, childIdentityColumn;
	
	if (_.isArray(mapping)) {
		if (mapping.length !== 1) {
			throw 'array property must have a single entry';
		}
		
		return NestHydrationJS.identityColumnToPropertyList(mapping[0]);
	}
	
	idColToPropList = {};
	
	propertyList = _.keys(mapping);
	
	if (propertyList.length === 0) {
		throw 'must have at least one property';
	}
	
	identityColumn = mapping[propertyList[0]];
	
	for (i = 0; i < propertyList.length; i++) {
		property = propertyList[i];
		
		column = mapping[property];
		
		if (typeof column === 'string') {
			if (typeof idColToPropList[identityColumn] === 'undefined') {
				idColToPropList[identityColumn] = [];
			}
			idColToPropList[identityColumn].push(property);
		} else {
			// OPTIMIZATION IDEA: This code progressivily copies the contents
			// of childPLM outwards for each depth of recursion, could instead
			// pass in flat destination structure and operate directly on it.
			// This would be a fairly minor optimization because this code is
			// only executed once per query and the depth of nesting, the
			// number of columns nested are seldom significant
			childPLM = NestHydrationJS.identityColumnToPropertyList(column);
			
			for (childIdentityColumn in childPLM) {
				if (typeof idColToPropList[childIdentityColumn] === 'undefined') {
					idColToPropList[childIdentityColumn] = [];
				}
				idColToPropList[childIdentityColumn] = idColToPropList[childIdentityColumn]
					.concat(childPLM[childIdentityColumn])
				;
			}
		}
	}
	
	return idColToPropList;
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
