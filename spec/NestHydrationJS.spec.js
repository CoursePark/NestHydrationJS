'use strict';

var NestHydrationJS = require('../NestHydrationJS');

describe('NestHydrationJS', function () {
	describe('nest method', function () {
		describe('simple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: 'a'
				};
				var data = {a: 'value 1'};
				result = NestHydrationJS.nest(data, mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {a: 'value 1'};
				expect(result).toEqual(expected);
			});
		});
		
		describe('simple mapping, redundant data', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: 'a'
				};
				var data = {a: 'value 1', b: 'value 2'};
				result = NestHydrationJS.nest(data, mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {a: 'value 1'};
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
				var data = {a: 'value 1', b: 'value 2'};
				result = NestHydrationJS.nest(data, mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {a: 'value 1', b: 'value 2'};
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: 'a',
					b: 'b'
				}];
				var data = [
					{a: 'value 1', b: 'value 2'},
					{a: 'value 3', b: 'value 4'},
					{a: 'value 5', b: 'value 6'}
				];
				result = NestHydrationJS.nest(data, mapping);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{a: 'value 1', b: 'value 2'},
					{a: 'value 3', b: 'value 4'},
					{a: 'value 5', b: 'value 6'}
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('multiple mapping array, hinted mapping', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_a: 'value 1', _b: 'value 2'},
					{_a: 'value 3', _b: 'value 4'},
					{_a: 'value 5', _b: 'value 6'}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{a: 'value 1', b: 'value 2'},
					{a: 'value 3', b: 'value 4'},
					{a: 'value 5', b: 'value 6'}
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, one to one', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a_id: 'a1'},
					{_id: '2', _a_id: 'a2'},
					{_id: '3', _a_id: 'a3'}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: '1', a: {id: 'a1'}},
					{id: '2', a: {id: 'a2'}},
					{id: '3', a: {id: 'a3'}}
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, one to one, null', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a_id: null}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: '1', a: null}
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, one to many', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a__id: 'a1'},
					{_id: '1', _a__id: 'a2'},
					{_id: '2', _a__id: 'a3'}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: '1', a: [
						{id: 'a1'},
						{id: 'a2'}
					]},
					{id: '2', a: [
						{id: 'a3'}
					]},
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, one to many, references previously used', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a__id: 'a1'},
					{_id: '1', _a__id: 'a2'},
					{_id: '2', _a__id: 'a1'}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: '1', a: [
						{id: 'a1'},
						{id: 'a2'}
					]},
					{id: '2', a: [
						{id: 'a1'}
					]},
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, one to many, empty', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a__id: null},
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: '1', a: []}
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('complex', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a__id: null, _a__a: null, _a__b__id: null, _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '2', _a__id: '1',  _a__a: '1',  _a__b__id: null, _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '2', _a__id: '2',  _a__a: '2',  _a__b__id: '1',  _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '2', _a__id: '2',  _a__a: '2',  _a__b__id: '2',  _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{
						id: '1',
						a: [],
						b: {
							id: '1',
							a: '1',
							b: [
								{
									id: '1',
									a: '1'
								}
							]
						}
					},
					{
						id: '2',
						a: [
							{
								id: '1',
								a: '1',
								b: []
							},
							{
								id: '2',
								a: '2',
								b: [
									{
										id: '1'
									},
									{
										id: '2'
									}
								]
							}
						],
						b: {
							id: '1',
							a: '1',
							b: [
								{
									id: '1',
									a: '1'
								}
							]
						}
					}
				];
				expect(result).toEqual(expected);
			});
		});
	});
	
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
							oneToOneList: [],
							oneToManyPropList: [],
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
							oneToOneList: [],
							oneToManyPropList: [],
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
							oneToOneList: [],
							oneToManyPropList: [],
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
							oneToOneList: [
								{prop: 'c', column: '_c_d'}
							],
							oneToManyPropList: [
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
							oneToOneList: [],
							oneToManyPropList: [],
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
							oneToOneList: [],
							oneToManyPropList: [],
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
