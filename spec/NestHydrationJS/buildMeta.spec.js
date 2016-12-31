'use strict';

var NestHydrationJS = require('../../NestHydrationJS')();

describe('NestHydrationJS', function () {
	describe('buildMeta method', function () {
		describe('simple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: 'aColumnName'
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['aColumnName'],
					trimmerList: [],
					idMap: {
						aColumnName: {
							valueList: [
								{prop: 'a', column: 'aColumnName', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple mapping with number type', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: {column: 'a', type: 'NUMBER'}
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					trimmerList: [],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: 'NUMBER', default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple mapping with boolean type', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: {column: 'a', type: 'BOOLEAN'}
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					trimmerList: [],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: 'BOOLEAN', default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple mapping with id default value', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: {column: 'a', type: 'BOOLEAN', default: 'a_default'}
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					trimmerList: [],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: 'BOOLEAN', default: 'a_default'}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: 'a_default'
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple mapping with id trimmer value', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: {column: 'a', trimmer: true}
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					trimmerList: [
						{path: [], prop: 'a'}
					],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: 'a',
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple mapping with multiple trimmer values in a single array, 2nd should be ignored', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: {column: 'a', trimmer: true},
					b: {column: 'b', trimmer: true}
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					trimmerList: [
						{path: [], prop: 'a'}
					],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: undefined, default: undefined},
								{prop: 'b', column: 'b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: 'a',
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('nested mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: '_a',
					b: [{
						c: '_b__c'
					}]
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a', '_b__c'],
					trimmerList: [],
					idMap: {
						'_a': {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [
								'b'
							],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						},
						'_b__c': {
							valueList: [
								{prop: 'c', column: '_b__c', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_a',
							ownProp: 'b',
							isOneOfMany: true,
							cache: {},
							containingIdUsage: {},
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple nested mapping with id trimmer value', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: '_a',
					b: [{
						c: {column: '_b__c', trimmer: true}
					}]
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a', '_b__c'],
					trimmerList: [
						{path: ['_a'], prop: 'c'}
					],
					idMap: {
						'_a': {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [
								'b'
							],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						},
						'_b__c': {
							valueList: [
								{prop: 'c', column: '_b__c', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_a',
							ownProp: 'b',
							isOneOfMany: true,
							cache: {},
							containingIdUsage: {},
							trimmerProp: 'c',
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: 'a',
					b: 'b'
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					trimmerList: [],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: undefined, default: undefined},
								{prop: 'b', column: 'b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping having id with default', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: {column: '_a', default: 'a_default'},
					b: '_b'
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					trimmerList: [],
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: 'a_default'},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: 'a_default'
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping complex having default', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					id: '_id',
					a: {
						c: {column: '_c', default: 'c_default'}
					},
					b: '_b'
				};
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_id'],
					trimmerList: [],
					idMap: {
						_c: {
							valueList: [
								{prop: 'c', column: '_c', type: undefined, default: 'c_default'}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_id',
							ownProp: 'a',
							isOneOfMany: false,
							cache: {},
							containingIdUsage: {},
							trimmerProp: null,
							default: 'c_default'
						},
						_id: {
							valueList: [
								{prop: 'id', column: '_id', type: undefined, default: undefined},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [{prop: 'a', column: '_c'}],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: '_a',
					b: '_b'
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					trimmerList: [],
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: undefined},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array, id being non first', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: '_a',
					b: {column: '_b', id: true}
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_b'],
					trimmerList: [],
					idMap: {
						_b: {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: undefined},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array with id having type', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: {column: '_a', type: 'NUMBER'},
					b: '_b'
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					trimmerList: [],
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: 'NUMBER', default: undefined},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array with id having default', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: {column: '_a', default: 'a_default'},
					b: '_b'
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					trimmerList: [],
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: 'a_default'},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: 'a_default'
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array with trimmer on non id column', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: '_a',
					b: {column: '_b', trimmer: true}
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					trimmerList: [
						{path: [], prop: 'b'}
					],
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: undefined},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: 'b',
							default: undefined
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping complex', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: '_a',
					b: '_b',
					c: {
						d: '_c_d'
					},
					e: [{
						f: '_e__f',
						g: '_e__g',
						h: [{
							i: '_e__h__i',
							j: {column: '_e__h__j', trimmer: true}
						}]
					}]
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a', '_e__f', '_e__h__i'],
					trimmerList: [
						{path: ['_a', '_e__f', '_e__h__i'], prop: 'j'}
					],
					idMap: {
						'_a': {
							valueList: [
								{prop: 'a', column: '_a', type: undefined, default: undefined},
								{prop: 'b', column: '_b', type: undefined, default: undefined}
							],
							toOneList: [
								{prop: 'c', column: '_c_d'}
							],
							toManyPropList: [
								'e'
							],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null,
							trimmerProp: null,
							default: undefined
						},
						'_c_d': {
							valueList: [
								{prop: 'd', column: '_c_d', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_a',
							ownProp: 'c',
							isOneOfMany: false,
							cache: {},
							containingIdUsage: {},
							trimmerProp: null,
							default: undefined
						},
						'_e__f': {
							valueList: [
								{prop: 'f', column: '_e__f', type: undefined, default: undefined},
								{prop: 'g', column: '_e__g', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [
								'h'
							],
							containingColumn: '_a',
							ownProp: 'e',
							isOneOfMany: true,
							cache: {},
							containingIdUsage: {},
							trimmerProp: null,
							default: undefined
						},
						'_e__h__i': {
							valueList: [
								{prop: 'i', column: '_e__h__i', type: undefined, default: undefined},
								{prop: 'j', column: '_e__h__j', type: undefined, default: undefined}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_e__f',
							ownProp: 'h',
							isOneOfMany: true,
							cache: {},
							containingIdUsage: {},
							trimmerProp: 'j',
							default: undefined
						}
					}
				};
				expect(result.primeIdColumnList).toEqual(expected.primeIdColumnList);
				expect(result.idMap['_a']).toEqual(expected.idMap['_a']);
				expect(result.idMap['_c_d']).toEqual(expected.idMap['_c_d']);
				expect(result.idMap['_e__f']).toEqual(expected.idMap['_e__f']);
				// expect(result).toEqual(expected);
			});
		});
		
		describe('malformed mapping, empty array in place as property', function () {
			var error;
			beforeEach(function () {
				var mapping = {
					a: []
				};
				
				try {
					NestHydrationJS.buildMeta(mapping);
				} catch (err) {
					error = err;
				}
			});
			
			it('should match expected error', function () {
				expect(error.message).toEqual('invalid structPropToColumnMap format - property \'a\' can not be an empty array');
			});
		});
		
		describe('malformed mapping, base array should not have a multiple items as there can only be one root to the datastructure', function () {
			var error;
			beforeEach(function () {
				// bad formatting, doesn't even make sense really
				var mapping = [
					{a: 'rootA_'},
					{b: 'rootB_'}
				];
				
				try {
					NestHydrationJS.buildMeta(mapping);
				} catch (err) {
					error = err;
				}
			});
			
			it('should match expected error', function () {
				expect(error.message).toEqual('invalid structPropToColumnMap format - can not have multiple roots for structPropToColumnMap, if an array it must only have one item');
			});
		});
		
		describe('malformed mapping, number as property', function () {
			var error;
			beforeEach(function () {
				var mapping = {
					a: 5
				};
				
				try {
					NestHydrationJS.buildMeta(mapping);
				} catch (err) {
					error = err;
				}
			});
			
			it('should match expected error', function () {
				expect(error.message).toEqual('invalid structPropToColumnMap format - property \'a\' must be either a string, a plain object or an array');
			});
		});
		
		describe('malformed mapping, non plain object as property', function () {
			var error;
			beforeEach(function () {
				var mapping = {
					a: new Error()
				};
				
				try {
					NestHydrationJS.buildMeta(mapping);
				} catch (err) {
					error = err;
				}
			});
			
			it('should match expected error', function () {
				expect(error.message).toEqual('invalid structPropToColumnMap format - property \'a\' must be either a string, a plain object or an array');
			});
		});
		
		describe('malformed mapping, empty object as property', function () {
			var error;
			beforeEach(function () {
				var mapping = {
					a: {}
				};
				
				try {
					NestHydrationJS.buildMeta(mapping);
				} catch (err) {
					error = err;
				}
			});
			
			it('should match expected error', function () {
				expect(error.message).toEqual('invalid structPropToColumnMap format - property \'a\' can not be an empty object');
			});
		});
		
		describe('malformed mapping, empty object as property', function () {
			var error;
			beforeEach(function () {
				var mapping = {};
				
				try {
					NestHydrationJS.buildMeta(mapping);
				} catch (err) {
					error = err;
				}
			});
			
			it('should match expected error', function () {
				expect(error.message).toEqual('invalid structPropToColumnMap format - the base object can not be an empty object');
			});
		});
	});
});
