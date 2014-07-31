(function() {
	var NestHydrationJS;
	
	_ = require('lodash');
	
	NestHydrationJS = (function() {
		
		NestHydrationJS.prototype.nest = function(table, propertyMapping) {
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
			
			if (_.isEmpty(propertyMapping)) {
				// properties is empty, can't form structure or determine content
				// for a list. Assume a structure unless listOnEmpty
				return listOnEmpty ? [] : null;
			}
		};
		
		/* Returns a property mapping data structure based on the names of columns
		 * in columnList. Used internally by nest when its propertyMapping param
		 * is not specified.
		 */
		NestHydrationJS.prototype.propertyMappingFromColumnHints = function(columnList) {
			var propertyMapping, i, column, pointer, leaf, j, nav;
			
			if (columnList.length === 0 && columnList[0].substr(0, 1) === '_') {
				// column name starts with a '_', base element is an array
				propertyMapping = [];
			} else {
				// base element is a property list
				propertyMapping = {};
			}
			
			for (i = 0; i < columnList.length; i++) {
				column = columnList[i];
				
				pointer = propertyMapping; // point to base on each new column
				
				navList = column.split('_');
				leaf = navList.pop();
				
				for (j = 0; j < navList.length; j++) {
					nav = navList[j];
					
					if (nav === '') {
						nav = 0;
					}
########### trying to sort things out right here
########### main issue is that the following code made use of PHPs arrays being the same as objects, JS does not work that way					
					if (!array_key_exists($nav, $pointer)) {
						$pointer[$nav] = array();
					}
					
					pointer = pointer[nav];
				}
				pointer[leaf] = column;
			}
			
			return propertyMapping;
		};
		
		return NestHydrationJS;
	})();
	
	module.exports = NestHydrationJS;
	
}).call(this);
