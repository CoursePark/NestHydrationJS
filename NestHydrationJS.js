'use strict';

var NestHydrationJS, _;

_ = require('lodash');

NestHydrationJS = {};

NestHydrationJS.nest = function (table, propertyMapping) {
	var listOnEmpty = false;
	
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
		return listOnEmpty ? array() : null;
	}
	
	if (_.isPlainObject(table)) {
		// internal table should be a table format but a plaing object
		// could be passed as the first (and only) row of that table
		table = [table];
	}
	
	if (propertyMapping === null) {
		// property mapping not specified, determine it from column names
		propertyMapping = this.propertyMappingFromColumnHints(_.keys(table[0]));
	}
	
	if (propertyMapping === null) {
		// properties is empty, can't form structure or determine content
		// for a list. Assume a structure unless listOnEmpty
		return listOnEmpty ? [] : null;
	}
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
					pointer[prop][nav] = null;
				}
				pointer = pointer[prop];
				prop = nav;
			}
		}
	}
	
	return propertyMapping.base;
};

module.exports = NestHydrationJS;
