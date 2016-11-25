'use strict';

var NestHydrationJS = require('../../NestHydrationJS')();

describe('NestHydrationJS', function () {
	describe('registerType function', function () {
		it('should register new type register', function() {
			var handler = function(){};
			NestHydrationJS.registerType('FOO', handler);
			expect(NestHydrationJS.typeHandlers.FOO).toBe(handler);
		});
		it('should error on overwrite of existing type handler', function() {
			var handler = function(){};
			expect(NestHydrationJS.registerType.bind(NestHydrationJS, 'NUMBER', handler)).toThrowError(/Handler with type, NUMBER, already exists/);
		});
	});
});
