'use strict';

var NestHydrationJS = require('../../NestHydrationJS');

describe('NestHydrationJS', function () {
	describe('nest method', function () {
		describe('null data', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					a: 'a'
				};
				var data = null;
				result = NestHydrationJS.nest(data, mapping);
			});
			
			it('should match expected structure', function () {
				var expected = null;
				expect(result).toEqual(expected);
			});
		});
		
		describe('empty data', function () {
			var result;
			beforeEach(function () {
				var mapping = [{
					a: 'a'
				}];
				var data = [];
				result = NestHydrationJS.nest(data, mapping);
			});
			
			it('should match expected structure', function () {
				var expected = [];
				expect(result).toEqual(expected);
			});
		});
		
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
		
		describe('hinted mapping, to one', function () {
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
		
		describe('hinted mapping, to one, integer id', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: 1, _a_id: 1},
					{_id: 2, _a_id: 2},
					{_id: 3, _a_id: 3}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: 1, a: {id: 1}},
					{id: 2, a: {id: 2}},
					{id: 3, a: {id: 3}}
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, to one, null', function () {
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
		
		describe('hinted mapping, to many', function () {
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
		
		describe('hinted mapping, to many, integer id', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: 1, _a__id: 1},
					{_id: 1, _a__id: 2},
					{_id: 2, _a__id: 3}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{id: 1, a: [
						{id: 1},
						{id: 2}
					]},
					{id: 2, a: [
						{id: 3}
					]},
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('hinted mapping, to many, references previously used', function () {
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
		
		describe('hinted mapping, to many, empty', function () {
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
		
		describe('hinted mapping, to many, double up', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_col1: '1a', _col2: '2a', _col3: '3a', _sub__col1: 'sub 1a', _sub__col2: 'sub 2a', _sub__col3: 'sub 3a'},
					{_col1: '1a', _col2: '2a', _col3: '3a', _sub__col1: 'sub 1b', _sub__col2: 'sub 2b', _sub__col3: 'sub 3b'},
					{_col1: '1b', _col2: '2b', _col3: '3b', _sub__col1: 'sub 1a', _sub__col2: 'sub 2a', _sub__col3: 'sub 3a'},
					{_col1: '1b', _col2: '2b', _col3: '3b', _sub__col1: 'sub 1b', _sub__col2: 'sub 2b', _sub__col3: 'sub 3b'}
				];
				result = NestHydrationJS.nest(data);
			});
			
			it('should match expected structure', function () {
				var expected = [
					{col1: '1a', col2: '2a', col3: '3a', sub: [
						{col1: 'sub 1a', col2: 'sub 2a', col3: 'sub 3a'},
						{col1: 'sub 1b', col2: 'sub 2b', col3: 'sub 3b'}
					]},
					{col1: '1b', col2: '2b', col3: '3b', sub: [
						{col1: 'sub 1a', col2: 'sub 2a', col3: 'sub 3a'},
						{col1: 'sub 1b', col2: 'sub 2b', col3: 'sub 3b'},
					]},
				];
				expect(result).toEqual(expected);
			});
		});
		
		describe('complex', function () {
			var result;
			beforeEach(function () {
				var data = [
					{_id: '1', _a__id: null, _a__a: null, _a__b__id: null, _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '1', _a__id: null, _a__a: null, _a__b__id: null, _b_id: '1', _b_a: '1', _b_b__id: '2', _b_b__a: null},
					{_id: '2', _a__id: '1',  _a__a: '1',  _a__b__id: null, _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '2', _a__id: '2',  _a__a: '2',  _a__b__id: '1',  _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '2', _a__id: '2',  _a__a: '2',  _a__b__id: '2',  _b_id: '1', _b_a: '1', _b_b__id: '1', _b_b__a: '1'},
					{_id: '2', _a__id: '2',  _a__a: '2',  _a__b__id: '2',  _b_id: '1', _b_a: '1', _b_b__id: '2', _b_b__a: null}
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
								},
								{
									id: '2',
									a: null
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
								},
								{
									id: '2',
									a: null
								}
							]
						}
					}
				];
				expect(result).toEqual(expected);
			});
		});
	});
});
