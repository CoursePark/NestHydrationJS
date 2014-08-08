'use strict';

var NestHydrationJS = require('../NestHydrationJS');

describe('NestHydrationJS', function () {
	describe('propertyMappingFromColumnHints method', function () {
		describe('passed empty as columnList', function () {
			var result;
			beforeEach(function () {
				var columnList = [];
				result = NestHydrationJS.propertyMappingFromColumnHints(columnList);
			});
			
			it('should return null', function () {
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
			
			it('should return null', function () {
				var expected = {
					a: null
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
			
			it('should return null', function () {
				var expected = {
					a: null,
					b: null
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
			
			it('should return null', function () {
				var expected = [{
					a: null
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
			
			it('should return null', function () {
				var expected = [{
					a: null,
					b: null
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
			
			it('should return null', function () {
				var expected = {
					a: null,
					b: {
						c: null
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
			
			it('should return null', function () {
				var expected = [{
					id: null,
					a: {
						id: null,
						b: null,
						c: [{
							id: null,
							d: null
						}]
					}
				}];
				expect(result).toEqual(expected);
			});
		});
	});
});
