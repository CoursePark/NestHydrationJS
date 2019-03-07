'use strict';

import { create } from "domain";
import { Z_DEFAULT_COMPRESSION } from "zlib";

const isArray = require('lodash.isarray');
const isFunction = require('lodash.isfunction');
const keys = require('lodash.keys');
const values = require('lodash.values');
const isPlainObject = require('lodash.isplainobject');

module NestHydrationJS {
	interface TypeHandlers {
		[index: string]: TypeHandler
	}

	interface TypeHandler {
		(cellValue: any): any
	}
	
	interface MetaValueProps {
		prop: string,
		column: string,
		type?: string | TypeHandler,
		default?: any,
		array?: boolean
	}
	
	interface Dictionary<TValue> {
		[index: string]: TValue;
	}
	
	interface MetaColumnData {
		valueList: Array<MetaValueProps>,
		toOneList: Array<MetaValueProps>,
		arraysList: Array<MetaValueProps>,
		toManyPropList: Array<string>,
		containingColumn: Array<string> | null,
		ownProp: string | null,
		isOneOfMany: boolean,
		cache: Dictionary<any>,
		containingIdUsage: Dictionary<Dictionary<boolean>> | null,
		defaults: Dictionary<string | null>
	}
	
	interface MetaData {
		primeIdColumnList: Array<Array<string>>,
		idMap: { [index: string]: MetaColumnData }
	}
	
	interface DefinitionColumn {
		column: string,
		id?: boolean,
		default?: any,
		type?: string,
		array?: boolean
	}
	
	interface Definition {
		[index: string]: DefinitionColumn | string | Definition | Definition[]
	}
	
	interface Data {
		[index: string]: any,
		[index: number]: any
	}

	function createCompositeKey(values: Array<string|number>, separator = ', '): string {
		return values.join(separator);
	}

	export class NestHydrationJS {
	
		private typeHandlers = {
			NUMBER: function (cellValue: any) {
				return parseFloat(cellValue);
			},
			BOOLEAN: function (cellValue: any) {
				return cellValue == true;
			}
		} as TypeHandlers;
	
		private struct: object | Array<any> | null = null

		private computeActualCellValue(props: MetaValueProps, initialValue: any) {
			let cellValue = initialValue;
			if (cellValue !== null) {
				let valueTypeFunction: TypeHandler | undefined;
	
				if (isFunction(props.type)) {
					valueTypeFunction = props.type as TypeHandler;
				} else if (typeof props.type === 'string') {
					valueTypeFunction = this.typeHandlers[props.type];
				}
	
				if (valueTypeFunction) {
					cellValue = valueTypeFunction(cellValue);
				}
			} else if (typeof props.default !== 'undefined') {
				cellValue = props.default;
			}
			return cellValue;
		}
		
		/* Creates a data structure containing nested objects and/or arrays from
		 * tabular data based on a structure definition provided by
		 * structPropToColumnMap. If structPropToColumnMap is not provided but
		 * the data has column names that follow a particular convention then a
		 * nested structures can also be created.
		 */
		nest(data: any, structPropToColumnMap: Definition | Definition[] | null | boolean, verbose = false): any {
			
			let table;
			
			// VALIDATE PARAMS AND BASIC INITIALIZATION
			
			// Determines that on no results, and empty list is used instead of null. // NOTE: fact check this
			let listOnEmpty = false;
			
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
				structPropToColumnMap = this.structPropToColumnMapFromColumnHints(keys(table[0]));
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
			
			let meta = this.buildMeta(<Definition | Definition[]>structPropToColumnMap, verbose);

			// BUILD FROM TABLE
			
			// defines function that can be called recursively
			let _nest = (row: Dictionary<any>, idColumns: string[]) => {
				
				// Obj is the actual object that will end up in the final structure
				let obj: Data;
				
				// Get all of the values for each id
				let values: Array<any> = idColumns.map(column => row[column]);
				
				// only really concerned with the meta data for this identity column
				let objMeta = meta.idMap[createCompositeKey(idColumns)];
				
				// If any of the values are null, we'll check and see if we need to set defaults
				values = values.map((value, idx) => {
					if (value === null) {
						if (objMeta.defaults[idColumns[idx]] !== null && typeof objMeta.defaults[idColumns[idx]] !== 'undefined') {
							return objMeta.defaults[idColumns[idx]];
						}
					}
					return value;
				})

				if (values.includes(null)) return;
				
				// check if object already exists in cache
				if (typeof objMeta.cache[createCompositeKey(values)] !== 'undefined') {

					// not already placed as to-many relation in container
					obj = objMeta.cache[createCompositeKey(values)];

					// Add array values if necessary
					if (objMeta.arraysList.length > 0) {
						for (let prop of objMeta.arraysList) {
							let cellValue = this.computeActualCellValue(prop, row[prop.column])
							if (isArray(obj[prop.prop])) {
								obj[prop.prop].push(cellValue)
							}
						}
					}

					if (objMeta.containingIdUsage === null) return;
					
					// We know for certain that containing column is set if
					// containingIdUsage is not null and can cast it as a string
	
					// check and see if this has already been linked to the parent,
					// doesn't contain any array lists,
					// and if so we don't need to continue
					let containingIds = (<Array<string>>objMeta.containingColumn).map(column => row[column]);
					if (typeof objMeta.containingIdUsage[createCompositeKey(values)] !== 'undefined'
						&& typeof objMeta.containingIdUsage[createCompositeKey(values)][createCompositeKey(containingIds)] !== 'undefined'
					) return;
					
				} else {
					// don't have an object defined for this yet, create it and set the cache
					obj = {};
					objMeta.cache[createCompositeKey(values)] = obj;
					
					// copy in properties from table data
					for (let prop of objMeta.valueList) {
						if (prop.array === true) continue;
						let cellValue = this.computeActualCellValue(prop, row[prop.column]);
						obj[prop.prop] = cellValue;
					}

					// Add array values
					if (objMeta.arraysList.length > 0) {
						for (let prop of objMeta.arraysList) {
							let cellValue = this.computeActualCellValue(prop, row[prop.column]);
							if (isArray(obj[prop.prop])) {
								obj[prop.prop].push(cellValue)
							} else {
								obj[prop.prop] = [cellValue]
							}
						}
					}
					
					// initialize empty to-many relations, they will be populated when
					// those objects build themselves and find this containing object
					for (let k = 0; k < objMeta.toManyPropList.length; k++) {
						obj[objMeta.toManyPropList[k]] = [];
					}
					
					// initialize null to-one relations and then recursively build them
					for (let k = 0; k < objMeta.toOneList.length; k++) {
						obj[objMeta.toOneList[k].prop] = null;
						_nest(row, [objMeta.toOneList[k].column]);
					}
				}
				
				// link from the parent
				if (objMeta.containingColumn === null) {
					// parent is the top level
					if (objMeta.isOneOfMany) {
						// it is an array
						if (this.struct === null) {
							this.struct = [];
						}
						(<Array<any>>this.struct).push(obj);
					} else {
						// it is this object
						this.struct = obj;
					}
				} else {
					let containingIds = objMeta.containingColumn.map(column => row[column]);
					let container = meta.idMap[createCompositeKey(objMeta.containingColumn)].cache[createCompositeKey(containingIds)];
	
					// If a container exists, it must not be a root, and thus there should
					// be an ownProp set
					if (container) {
						if (objMeta.isOneOfMany) {
							// it is an array
							container[<string>objMeta.ownProp].push(obj);
						} else {
							// it is this object
							container[<string>objMeta.ownProp] = obj;
						}
					}
					
					// record the containing id so we don't do this again (return in earlier
					// part of this method)
					const containingIdUsage = <Dictionary<Dictionary<boolean>>>objMeta.containingIdUsage
					if (typeof (containingIdUsage)[createCompositeKey(values)] === 'undefined') {
						containingIdUsage[createCompositeKey(values)] = {};
					}
					containingIdUsage[createCompositeKey(values)][createCompositeKey(containingIds)] = true;
				}
			};
			
			// struct is populated inside the build function
			this.struct = null;

			if (verbose) console.log(meta);
			
			for (let i = 0; i < table.length; i++) {
				// go through each row of the table
				let row = table[i];
				
				for (let j = 0; j < meta.primeIdColumnList.length; j++) {
					// for each prime id column (corresponding to a to-many relation or
					// the top level) attempted to build an object
					let primeIdColumn = meta.primeIdColumnList[j];
					_nest(row, primeIdColumn);
				}
			}
			
			return this.struct;
		};
	
		/* Create a data structure that contains lookups and cache spaces for quick
		 * reference and action for the workings of the nest method.
		 */
		private buildMeta(structPropToColumnMap: Definition | Definition[], verbose = false): MetaData {
	
			var meta: MetaData;
	
			// internally defines recursive function with extra param. This allows cleaner API		
			let _buildMeta = function(
				structPropToColumnMap: Definition, 
				isOneOfMany: boolean, 
				containingColumn: Array<string> | null, 
				ownProp: string | null) 
			{
				// var idProp: string | undefined, subIdColumn;
	
				let idProps = [];
				let idColumns = [];
				
				let propList = keys(structPropToColumnMap);
				if (propList.length === 0) {
					throw new Error('invalid structPropToColumnMap format - property \'' + ownProp + '\' can not be an empty array');
				}
				
				for (let i = 0; i < propList.length; i++) {
					let prop = propList[i];
					if ((<DefinitionColumn>structPropToColumnMap[prop]).id === true) {
						// idProp = prop;
						idProps.push(prop);
					}
				}
	
				if (idProps.length === 0) {
					idProps.push(propList[0]);
				}
	
				idColumns = idProps.map(prop => (<DefinitionColumn>structPropToColumnMap[prop]).column || structPropToColumnMap[prop]) as Array<string>;
				
				if (isOneOfMany) {
					meta.primeIdColumnList.push(idColumns);
				}

				let defaults: Dictionary<string | null> = {}

				idProps.forEach(prop => {
					defaults[prop] = typeof (<DefinitionColumn>structPropToColumnMap[prop]).default === 'undefined' ? null : (<DefinitionColumn>structPropToColumnMap[prop]).default
				})
				
				let objMeta: MetaColumnData = {
					valueList: [],
					toOneList: [],
					arraysList: [],
					toManyPropList: [],
					containingColumn: containingColumn,
					ownProp: ownProp,
					isOneOfMany: isOneOfMany === true,
					cache: {},
					containingIdUsage: containingColumn === null ? null : {},
					defaults: defaults
				};
				
				for (let i = 0; i < propList.length; i++) {
					let prop = propList[i];
					if (typeof structPropToColumnMap[prop] === 'string') {
						// value property
						objMeta.valueList.push({
							prop: prop,
							column: structPropToColumnMap[prop] as string,
							type: undefined,
							default: undefined,
							array: undefined
						});
					} else if ((<DefinitionColumn>structPropToColumnMap[prop]).column) {
						// value property
						const definitionColumn = <DefinitionColumn>structPropToColumnMap[prop]
						const metaValueProps = {
							prop: prop,
							column: definitionColumn.column,
							type: definitionColumn.type,
							default: definitionColumn.default,
							array: definitionColumn.array === true
						}
						objMeta.valueList.push(metaValueProps);
						// Add this column to our array list if necessary
						if (definitionColumn.array === true) {
							objMeta.arraysList.push(metaValueProps);
						}
					} else if (isArray(structPropToColumnMap[prop])) {
						// list of objects / to-many relation
						objMeta.toManyPropList.push(prop);
						
						_buildMeta((<Array<Definition>>structPropToColumnMap[prop])[0], true, idColumns, prop);
					} else if (isPlainObject(structPropToColumnMap[prop])) {
						// object / to-one relation
						
						let subIdColumn = values(structPropToColumnMap[prop])[0];
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
						_buildMeta(<Definition>structPropToColumnMap[prop], false, idColumns, prop);
					} else {
						throw new Error('invalid structPropToColumnMap format - property \'' + prop + '\' must be either a string, a plain object or an array');
					}
				}
				
				meta.idMap[createCompositeKey(idColumns)] = objMeta;
			};
			
			// this data structure is populated by the _buildMeta function
			meta = {
				primeIdColumnList: [],
				idMap: {}
			} as MetaData;
			
			if (isArray(structPropToColumnMap)) {
				if (structPropToColumnMap.length !== 1) {
					throw new Error('invalid structPropToColumnMap format - can not have multiple roots for structPropToColumnMap, if an array it must only have one item');
				}
				// call with first object, but inform _buildMeta it is an array
				_buildMeta((<Array<Definition>>structPropToColumnMap)[0], true, null, null);
			} else if (isPlainObject(structPropToColumnMap)) {

				// register first column as prime id column
				let columns = values(structPropToColumnMap) as any[];

				if (columns.length === 0) {
					throw new Error('invalid structPropToColumnMap format - the base object can not be an empty object');
				}

				// First determine if there are any keys set on the columns
				let keys = columns.reduce((accumulator: string[], column: any) => {
					if (column.id === true) {
						accumulator.push(column.column)
					}
					return accumulator;
				}, []);
				
				// If there were no keys set, then take the first column as the id
				if (keys.length === 0) {
					if (typeof columns[0] === 'string') {
						keys.push(columns[0])
					} else if(typeof columns[0].column === 'string') {
						keys.push(columns[0].column)
					}
				}

				meta.primeIdColumnList.push(keys);
				
				// construct the rest
				_buildMeta(<Definition>structPropToColumnMap, false, null, null);
			}
			return meta;
		};
		
		/* Returns a property mapping data structure based on the names of columns
		 * in columnList. Used internally by nest when its propertyMapping param
		 * is not specified.
		 * 
		 */
		structPropToColumnMapFromColumnHints(columnList: Array<string>, renameMapping?: Dictionary<string>) {
			
			if (typeof renameMapping === 'undefined') {
				renameMapping = {};
			}
			
			let propertyMapping: any = {base: null};
			
			for (let i = 0; i < columnList.length; i++) {
				let column = columnList[i];
				
				let columnType = column.split('___');
				
				let type = null;
				let isId = false;
				for (let j = 1; j < columnType.length; j++) {
					if (columnType[j] === 'ID') {
						isId = true;
					} else if (typeof this.typeHandlers[columnType[j]] !== 'undefined') {
						type = columnType[j];
					}
				}
				
				let pointer = propertyMapping; // point to base on each new column
				let prop: string | number = 'base';
				
				let navList = columnType[0].split('_');
				
				for (let j = 0; j < navList.length; j++) {
					let nav = navList[j];
					
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
							let renamedColumn: any = typeof renameMapping[column] === 'undefined'
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
		registerType(name: string, handler: TypeHandler) {
			if (this.typeHandlers[name]) {
				throw new Error('Handler with type, ' + name + ', already exists');
			}
			
			this.typeHandlers[name] = handler;
		};
	}
	
}

// We have to wrap this in a function for backwards compatablity
export = function generate(): NestHydrationJS.NestHydrationJS { return new NestHydrationJS.NestHydrationJS() };
