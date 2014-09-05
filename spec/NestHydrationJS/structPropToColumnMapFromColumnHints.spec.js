'use strict';

var NestHydrationJS = require('../../NestHydrationJS');

describe('NestHydrationJS', function () {
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
		
		describe('passed single direct property as columnList, number type', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a___NUMBER'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: {column: 'a___NUMBER', type: 'NUMBER'}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed single direct property as columnList, boolean type', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a___BOOLEAN'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: {column: 'a___BOOLEAN', type: 'BOOLEAN'}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed single direct property as columnList, renamed', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a'
				];
				var renameMap = {
					'a': 'col_1'
				};
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList, renameMap);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: 'col_1'
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
		
		describe('passed complex scenaro as columnList, rename', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'_id',
					'_a_id',
					'_a_b',
					'_a_c__id',
					'_a_c__d'
				];
				var renameMap = {
					'_a_c__id': 'col_0',
					'_a_c__d': 'col_1',
				};
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList, renameMap);
			});
			
			it('should match expected structure', function () {
				var expected = [{
					id: '_id',
					a: {
						id: '_a_id',
						b: '_a_b',
						c: [{
							id: 'col_0',
							d: 'col_1'
						}]
					}
				}];
				expect(result).toEqual(expected);
			});
		});
	});
});
