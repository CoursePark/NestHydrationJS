'use strict';

var NestHydrationJS = require('../../NestHydrationJS')();

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
		
		describe('passed single direct property as columnList, id column', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a___ID'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: {column: 'a___ID', id: true}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed single direct property as columnList, multiple id columns', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a___ID',
					'b___ID'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = 'invalid - multiple id - a___ID and b___ID conflict';
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed single direct property as columnList, id column and typed', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a___ID___NUMBER'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: {column: 'a___ID___NUMBER', type: 'NUMBER', id: true}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed single direct property as columnList, id column and typed, reverse order', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'a___NUMBER___ID'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					a: {column: 'a___NUMBER___ID', type: 'NUMBER', id: true}
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
		
		describe('passed complex single base scenaro as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'id',
					'a_id',
					'a_b',
					'a_c__id',
					'a_c__d',
					'a_e_id',
					'a_e_f'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					id: 'id',
					a: {
						id: 'a_id',
						b: 'a_b',
						c: [{
							id: 'a_c__id',
							d: 'a_c__d'
						}],
						e: {
							id: 'a_e_id',
							f: 'a_e_f'
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed complex single base scenaro as columnList with capitializations', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'id',
					'aItem__id',
					'aItem__bValue',
					'aItem__cItem__id',
					'aItem__cItem__dValue',
					'aItem__cItem__eItem_id',
					'aItem__cItem__eItem_fValue'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					id: 'id',
					aItem: [{
						id: 'aItem__id',
						bValue: 'aItem__bValue',
						cItem: [{
							id: 'aItem__cItem__id',
							dValue: 'aItem__cItem__dValue',
							eItem: {
								id: 'aItem__cItem__eItem_id',
								fValue: 'aItem__cItem__eItem_fValue'
							}
						}]
					}]
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed complex single base scenaro as columnList with number specifiers', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'id___NUMBER',
					'a_id___NUMBER',
					'a_b',
					'a_c__id___NUMBER',
					'a_c__d',
					'a_e_id___NUMBER',
					'a_e_f'
				];
				result = NestHydrationJS.structPropToColumnMapFromColumnHints(columnList);
			});
			
			it('should match expected structure', function () {
				var expected = {
					id: {
						column: 'id___NUMBER',
						type: 'NUMBER'
					},
					a: {
						id: {
							column: 'a_id___NUMBER',
							type: 'NUMBER'
						},
						b: 'a_b',
						c: [{
							id: {
								column: 'a_c__id___NUMBER',
								type: 'NUMBER'
							},
							d: 'a_c__d'
						}],
						e: {
							id: {
								column: 'a_e_id___NUMBER',
								type: 'NUMBER'
							},
							f: 'a_e_f'
						}
					}
				};
				expect(result).toEqual(expected);
			});
		});
		
		describe('passed complex array base scenaro as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [
					'_id',
					'_a_id',
					'_a_b',
					'_a_c__id',
					'_a_c__d',
					'_a_e_id',
					'_a_e_f'
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
						}],
						e: {
							id: '_a_e_id',
							f: '_a_e_f'
						}
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
					'_a_c__d': 'col_1'
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
