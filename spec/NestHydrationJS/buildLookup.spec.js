'use strict';

var NestHydrationJS = require('../../NestHydrationJS');

describe('NestHydrationJS', function () {
	describe('buildLookup method', function () {
		describe('simple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: 'a'
				};
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a'}
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
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['a'],
					idMap: {
						a: {
							valueList: [
								{prop: 'a', column: 'a'},
								{prop: 'b', column: 'b'}
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
				result = NestHydrationJS.buildLookup(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					primeIdColumnList: ['_a'],
					idMap: {
						_a: {
							valueList: [
								{prop: 'a', column: '_a'},
								{prop: 'b', column: '_b'}
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
								{prop: 'd', column: '_c_d'}
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
								{prop: 'f', column: '_e__f'},
								{prop: 'g', column: '_e__g'}
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
	});
});
