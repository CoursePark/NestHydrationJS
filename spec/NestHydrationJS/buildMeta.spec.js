'use strict';

var NestHydrationJS = require('../../NestHydrationJS');

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
					idMap: {
						aColumnName: {
							valueList: [
								{prop: 'a', column: 'aColumnName', type: null}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null
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
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: 'NUMBER'}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null
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
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: 'BOOLEAN'}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null
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
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a', type: null},
								{prop: 'b', column: 'b', type: null}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {},
							containingIdUsage: null
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
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: null},
								{prop: 'b', column: '_b', type: null}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null
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
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a', type: 'NUMBER'},
								{prop: 'b', column: '_b', type: null}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {},
							containingIdUsage: null
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
						g: '_e__g'
					}]
				}];
				result = NestHydrationJS.buildMeta(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a', '_e__f'],
					idMap: {
						'_a': {
							valueList: [
								{prop: 'a', column: '_a', type: null},
								{prop: 'b', column: '_b', type: null}
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
							containingIdUsage: null
						},
						'_c_d': {
							valueList: [
								{prop: 'd', column: '_c_d', type: null}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_a',
							ownProp: 'c',
							isOneOfMany: false,
							cache: {},
							containingIdUsage: {}
						},
						'_e__f': {
							valueList: [
								{prop: 'f', column: '_e__f', type: null},
								{prop: 'g', column: '_e__g', type: null}
							],
							toOneList: [],
							toManyPropList: [],
							containingColumn: '_a',
							ownProp: 'e',
							isOneOfMany: true,
							cache: {},
							containingIdUsage: {}
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
				// bad formating, doesn't even make sense really
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
