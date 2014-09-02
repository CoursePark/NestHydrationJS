NestHydrationJS
===============

Converts tabular data into a nested object/array structure based on a definition object or specially named columns.

Tabular Data With Definition
----------------------------

```javascript
var NestHydrationJS = require('nesthydrationjs');
var table = [
	{
		id: '1', title: 'Tabular to Objects',
		teacher_id: '1', teacher_name: 'David',
		lesson_id: '1', lesson_title: 'Defintions'
	},
	{
		id: '1', title: 'Tabular to Objects',
		teacher_id: '1', teacher_name: 'David',
		lesson_id: '2', lesson_title: 'Table Data'
	},
	{
		id: '1', title: 'Tabular to Objects',
		teacher_id: '1', teacher_name: 'David',
		lesson_id: '3', lesson_title: 'Objects'
	},
	{
		id: '2', title: 'Column Names Define Structure',
		teacher_id: '2', teacher_name: 'Chris',
		lesson_id: '4', lesson_title: 'Column Names'
	},
	{
		id: '2', title: 'Column Names Define Structure',
		teacher_id: '2', teacher_name: 'Chris',
		lesson_id: '2', lesson_title: 'Table Data'
	},
	{
		id: '2', title: 'Column Names Define Structure',
		teacher_id: '2', teacher_name: 'Chris',
		lesson_id: '3', lesson_title: 'Objects'
	},
	{
		id: '3', title: 'Object On Bottom',
		teacher_id: '1', teacher_name: 'David',
		lesson_id: '5', lesson_title: 'Non Array Input'
	}
];
var definition = [{
	id: 'id',
	title: 'title',
	teacher: {
		id: 'teacher_id',
		name: 'teacher_name'
	},
	lesson: [{
		id: 'lesson_id',
		title: 'lesson_title'
	}]
}];
result = NestHydrationJS.nest(table, definition);
/* result would be the following:
[
	{id: '1', title: 'Tabular to Objects', teacher: {id: '1', name: 'David'}, lesson: [
		{id: '1', title: 'Defintions'},
		{id: '2', title: 'Table Data'},
		{id: '3', title: 'Objects'}
	]},
	{id: '2', title: 'Column Names Define Structure', teacher: {id: '2', name: 'Chris'}, lesson: [
		{id: '4', title: 'Column Names'},
		{id: '2', title: 'Table Data'},
		{id: '3', title: 'Objects'}
	]},
	{id: '3', title: 'Object On Bottom', teacher: {id: '1', name: 'David'}, lesson: [
		{id: '5', title: 'Non Array Input'},
	]}
]
*/
```

SQL-ish Example
---------------

While not limited to SQL, it is common to want to define an SQL query and then just get back objects. Here's how.

In the following example you can see the same result but the definition of the object structure is contained in the column names of the tabular input. Nesting is achieved by using a underscore. A *x to one* relation is defined by a single underscore and a *x to many* relation is defined by preceeding properties of the many object with a 2nd underscore.

**Note:** that this means that almost always bottom level properties will be prefixed with a underscore, as this is actually a *x to many* relation from the variable returned from the next function. If 

```javascript
var sql = ''
	+ 'SELECT'
	+ 'c.id      AS _id,'
	+ 'c.title   AS _title,'
	+ 't.teacher AS _teacher_id,'
	+ 't.name    AS _teacher_name,'
	+ 'l.id      AS _lesson__id,'
	+ 'l.title   AS _lesson__title'
	+ 'FROM course AS c'
	+ 'JOIN teacher AS t ON t.id = c.teacher_id'
	+ 'JOIN course_lesson AS cl ON cl.course_id = c.id'
	+ 'JOIN lesson AS l ON l.id = cl.lesson_id'
;
var table = db.fetchAll(sql);
/* table could result in the following:
[
	{
		_id: '1', _title: 'Tabular to Objects',
		_teacher_id: '1', _teacher_name: 'David',
		_lesson__id: '1', _lesson__title: 'Defintions'
	},
	{
		_id: '1', _title: 'Tabular to Objects',
		_teacher_id: '1', _teacher_name: 'David',
		_lesson__id: '2', _lesson__title: 'Table Data'
	},
	{
		_id: '1', _title: 'Tabular to Objects',
		_teacher_id: '1', _teacher_name: 'David',
		_lesson__id: '3', _lesson__title: 'Objects'
	},
	{
		_id: '2', _title: 'Column Names Define Structure',
		_teacher_id: '2', _teacher_name: 'Chris',
		_lesson__id: '4', _lesson__title: 'Column Names'
	},
	{
		_id: '2', _title: 'Column Names Define Structure',
		_teacher_id: '2', _teacher_name: 'Chris',
		_lesson__id: '2', _lesson__title: 'Table Data'
	},
	{
		_id: '2', _title: 'Column Names Define Structure',
		_teacher_id: '2', _teacher_name: 'Chris',
		_lesson__id: '3', _lesson__title: 'Objects'
	},
	{
		_id: '3', _title: 'Object On Bottom',
		_teacher_id: '1', _teacher_name: 'David',
		_lesson__id: '5', _lesson__title: 'Non Array Input'
	}
]
*/
result = NestHydrationJS.nest(table);
/* result would be the following:
[
	{id: '1', title: 'Tabular to Objects', teacher: {id: '1', name: 'David'}, lesson: [
		{id: '1', title: 'Defintions'},
		{id: '2', title: 'Table Data'},
		{id: '3', title: 'Objects'}
	]},
	{id: '2', title: 'Column Names Define Structure', teacher: {id: '2', name: 'Chris'}, lesson: [
		{id: '4', title: 'Column Names'},
		{id: '2', title: 'Table Data'},
		{id: '3', title: 'Objects'}
	]},
	{id: '3', title: 'Object On Bottom', teacher: {id: '1', name: 'David'}, lesson: [
		{id: '5', title: 'Non Array Input'},
	]}
]
*/
```

Related Projects
----------------

- [NestHydration for PHP](https://github.com/CoursePark/NestHydration) : The original. But a new algorithm was implemented for the JS (this) version and ported back to PHP.
- [KnexNest](https://github.com/CoursePark/KnexNest) : Takes a [Knex.js](http://knexjs.org/) query object and returns objects.