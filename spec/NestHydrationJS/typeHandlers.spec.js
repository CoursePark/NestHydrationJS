'use strict';

var NestHydrationJS = require('../../NestHydrationJS')();

describe('NestHydrationJS', function () {
	describe('typeHandlers', function () {
		describe('NUMBER function', function () {
			it('should convert string to float', function() {
				expect(NestHydrationJS.typeHandlers.NUMBER('1.234')).toBeCloseTo(1.234);
			});
			it('should convert number to float', function() {
				expect(NestHydrationJS.typeHandlers.NUMBER(1.234)).toBeCloseTo(1.234);
			});
		});
		
		describe('BOOLEAN function', function () {
			it('should convert numeric 1 to true', function() {
				expect(NestHydrationJS.typeHandlers.BOOLEAN(1)).toBe(true);
			});
			it('should convert numeric 0 to false', function() {
				expect(NestHydrationJS.typeHandlers.BOOLEAN(0)).toBe(false);
			});
			it('should convert string 1 to true', function() {
				expect(NestHydrationJS.typeHandlers.BOOLEAN('1')).toBe(true);
			});
			it('should convert string 0 to false', function() {
				expect(NestHydrationJS.typeHandlers.BOOLEAN('0')).toBe(false);
			});
		});
	});
});
