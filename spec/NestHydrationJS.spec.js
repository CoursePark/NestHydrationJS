'use strict';

var NestHydrationJS = require('../NestHydrationJS');

describe('NestHydrationJS', function () {
	describe('buildLookup method', function () {
		describe('simple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					'a': 'a'
				};
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					idMap: {
						'a': {
							valueList: [
								{prop: 'a', column: 'a'}
							],
							oneToOneList: [],
							oneToManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {}
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
					'a': 'a',
					'b': 'b'
				};
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					idMap: {
						'a': {
							valueList: [
								{prop: 'a', column: 'a'},
								{prop: 'b', column: 'b'}
							],
							oneToOneList: [],
							oneToManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: false,
							cache: {}
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
					'a': '_a',
					'b': '_b'
				}];
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					idMap: {
						'_a': {
							valueList: [
								{prop: 'a', column: '_a'},
								{prop: 'b', column: '_b'}
							],
							oneToOneList: [],
							oneToManyPropList: [],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {}
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
					'a': '_a',
					'b': '_b',
					'c': {
						'd': '_c_d'
					},
					'e': [{
						'f': '_e__f',
						'g': '_e__g'
					}]
				}];
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a', '_e__f'],
					idMap: {
						'_a': {
							valueList: [
								{prop: 'a', column: '_a'},
								{prop: 'b', column: '_b'}
							],
							oneToOneList: [
								{prop: 'c', column: '_c_d'}
							],
							oneToManyPropList: [
								'e'
							],
							containingColumn: null,
							ownProp: null,
							isOneOfMany: true,
							cache: {}
						},
						'_c_d': {
							valueList: [
								{prop: 'd', column: '_c_d'}
							],
							oneToOneList: [],
							oneToManyPropList: [],
							containingColumn: '_a',
							ownProp: 'c',
							isOneOfMany: false,
							cache: {}
						},
						'_e__f': {
							valueList: [
								{prop: 'f', column: '_e__f'},
								{prop: 'g', column: '_e__g'}
							],
							oneToOneList: [],
							oneToManyPropList: [],
							containingColumn: '_a',
							ownProp: 'e',
							isOneOfMany: true,
							cache: {}
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
	});
	
	describe('structPropToColumnMapFromColumnHints method', function () {
		describe('passed empty as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				expect(result).toBeNull();
			});
		});
		
		describe('passed single direct property as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: 'a'
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed multiple direct properties as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a',
					'b'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: 'a',
					b: 'b'
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed single many relation property as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'_a'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = [{
					a: '_a'
				}];
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed multiple many relation properties as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'_a',
					'_b'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = [{
					a: '_a',
					b: '_b'
				}];
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed 2nd level depth on simple properties as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a',
					'b_c'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: 'a',
					b: {
						c: 'b_c'
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed complex scenaro as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'_id',
					'_a_id',
					'_a_b',
					'_a_c__id',
					'_a_c__d'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = [{
					id: '_id',
					a: {
						id: '_a_id',
						b: '_a_b',
						c: [{
							id: '_a_c__id',
							d: '_a_c__d'
						}]
					}
				}];
				expect(result).toEqual(expected);
			});
		});
	});
});
