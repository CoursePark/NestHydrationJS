'use strict';

var NestHydrationJS = require('../../lib/NestHydrationJS')();

// fdescribe('NestHydrationJS', function () {
// 	describe('nest method', function () {
// 		describe('Documentation Example 1', function () {
// 			var result;
// 			beforeEach(function () {
// 				var table = [
// 					{id: '1', title: 'Tabular to Objects',            teacher_id: '1', teacher_name: 'David', lesson_id: '1', lesson_title: 'Definitions'    },
// 					{id: '1', title: 'Tabular to Objects',            teacher_id: '1', teacher_name: 'David', lesson_id: '2', lesson_title: 'Table Data'     },
// 					{id: '1', title: 'Tabular to Objects',            teacher_id: '1', teacher_name: 'David', lesson_id: '3', lesson_title: 'Objects'        },
// 					{id: '2', title: 'Column Names Define Structure', teacher_id: '2', teacher_name: 'Chris', lesson_id: '4', lesson_title: 'Column Names'   },
// 					{id: '2', title: 'Column Names Define Structure', teacher_id: '2', teacher_name: 'Chris', lesson_id: '2', lesson_title: 'Table Data'     },
// 					{id: '2', title: 'Column Names Define Structure', teacher_id: '2', teacher_name: 'Chris', lesson_id: '3', lesson_title: 'Objects'        },
// 					{id: '3', title: 'Object On Bottom',              teacher_id: '1', teacher_name: 'David', lesson_id: '5', lesson_title: 'Non Array Input'}
// 				];
// 				var definition = [{
// 					id: 'id',
// 					title: 'title',
// 					teacher: {
// 						id: 'teacher_id',
// 						name: 'teacher_name'
// 					},
// 					lesson: [{
// 						id: 'lesson_id',
// 						title: 'lesson_title'
// 					}]
// 				}];
// 				result = NestHydrationJS.nest(table, definition);
// 			});
// 			it('should match expected structure', function () {
// 				var expected = [
// 					{id: '1', title: 'Tabular to Objects', teacher: {id: '1', name: 'David'}, lesson: [
// 						{id: '1', title: 'Definitions'},
// 						{id: '2', title: 'Table Data'},
// 						{id: '3', title: 'Objects'}
// 					]},
// 					{id: '2', title: 'Column Names Define Structure', teacher: {id: '2', name: 'Chris'}, lesson: [
// 						{id: '4', title: 'Column Names'},
// 						{id: '2', title: 'Table Data'},
// 						{id: '3', title: 'Objects'}
// 					]},
// 					{id: '3', title: 'Object On Bottom', teacher: {id: '1', name: 'David'}, lesson: [
// 						{id: '5', title: 'Non Array Input'}
// 					]}
// 				];
// 				expect(result).toEqual({});
// 			});
// 		});
// 	});
// });
