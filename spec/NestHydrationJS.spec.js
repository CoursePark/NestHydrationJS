'use strict';

var NestHydrationJS = require('../NestHydrationJS');

describe('NestHydrationJS', function () {
	describe('identityMappingFilter method', function () {
		describe('simple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					'a': 'a'
				};
				result = NestHydrationJS.identityMappingFilter(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					'a': 'a'
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
				result = NestHydrationJS.identityMappingFilter(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					'a': 'a'
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
				result = NestHydrationJS.identityMappingFilter(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = [{
					'a': '_a'
				}];
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
				result = NestHydrationJS.identityMappingFilter(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = [{
					'a': '_a',
					'c': {
						'd': '_c_d'
					},
					'e': [{
						'f': '_e__f'
					}]
				}];
				expect(result).toEqual(expected);
			});
		});
	});
	
	describe('populatePropertyListMap method', function () {
		describe('simple mapping', function () {
			var result;
			beforeEach(function () {
				var mapping = {
					'a': 'a'
				};
				result = NestHydrationJS.populatePropertyListMap(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					'a': ['a']
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
				result = NestHydrationJS.populatePropertyListMap(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					'a': ['a', 'b']
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
				result = NestHydrationJS.populatePropertyListMap(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					'_a': ['a', 'b']
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
				result = NestHydrationJS.populatePropertyListMap(mapping);
			});
			
			it('should match expected structure', function () {
				var expected = {
					'_a': ['a', 'b'],
					'_c_d': ['d'],
					'_e__f': ['f', 'g']
				};
				expect(result).toEqual(expected);
			});
		});
	});
	
	describe('propertyMappingFromColumnHints method', function () {
		describe('passed empty as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [];
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
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
