# NestHydrationJS

[![Build Status](https://travis-ci.org/CoursePark/NestHydrationJS.svg?branch=master)](https://travis-ci.org/CoursePark/NestHydrationJS)
[![Coverage Status](https://coveralls.io/repos/github/CoursePark/NestHydration/badge.svg?branch=master)](https://coveralls.io/github/CoursePark/NestHydration?branch=master)
[![Dependency Status](https://david-dm.org/CoursePark/NestHydrationJS.svg)](https://david-dm.org/CoursePark/NestHydrationJS)
[![NPM version](https://img.shields.io/npm/v/nesthydrationjs.svg)](https://www.npmjs.com/package/nesthydrationjs)

[Change Log](CHANGELOG.md)

Converts tabular data into a nested object/array structure based on a definition object or specially named columns.

## Tabular Data With Definition Object

Tabular data is considered to be an array of objects where each object represents a row and the properties of those objects are cell values with the keys representing the column names.

### Tabular Data

```javascript
var table = [
    {
        id: '1', title: 'Tabular to Objects', required: '1',
        teacher_id: '1', teacher_name: 'David',
        lesson_id: '1', lesson_title: 'Definitions'
    },
    {
        id: '1', title: 'Tabular to Objects', required: '1',
        teacher_id: '1', teacher_name: 'David',
        lesson_id: '2', lesson_title: 'Table Data'
    },
    {
        id: '1', title: 'Tabular to Objects', required: '1',
        teacher_id: '1', teacher_name: 'David',
        lesson_id: '3', lesson_title: 'Objects'
    },
    {
        id: '2', title: 'Column Names Define Structure', required: '0',
        teacher_id: '2', teacher_name: 'Chris',
        lesson_id: '4', lesson_title: 'Column Names'
    },
    {
        id: '2', title: 'Column Names Define Structure', required: '0',
        teacher_id: '2', teacher_name: 'Chris',
        lesson_id: '2', lesson_title: 'Table Data'
    },
    {
        id: '2', title: 'Column Names Define Structure', required: '0',
        teacher_id: '2', teacher_name: 'Chris',
        lesson_id: '3', lesson_title: 'Objects'
    },
    {
        id: '3', title: 'Object On Bottom', required: '0',
        teacher_id: '1', teacher_name: 'David',
        lesson_id: '5', lesson_title: 'Non Array Input'
    }
];
```

Above are 7 rows each with the cells data for the columns `id`, `title`, `required`, `teacher_id`, `teacher_name`, `lesson_id`, `lesson_title`.

Mapping from the property keys of the tabular data to nested objects is done in accordance to the definition object.

### Definition

```javascript
var definition = [{
    id: {column: 'id', type: 'NUMBER'},
    title: 'title',
    required: {column: 'required', type: 'BOOLEAN'},
    teacher: {
        id: {column: 'teacher_id', type: 'NUMBER'},
        name: 'teacher_name'
    },
    lesson: [{
        id: {column: 'lesson_id', type: 'NUMBER'},
        title: 'lesson_title'
    }]
}];
```

The definition object above maps:

- `id` to `result[#].id` with a type caste to a number
- `title` to `result[#].title`
- `required` to `result[#].required` with a type caste to a boolean
- `teacher_id` to `result[#].teacher.id` with a type caste to a number
- `teacher_name` to `result[#].teacher.name`
- `lesson_id` to `result[#].lesson[#].id` with a type caste to a number
- `lesson_title` to `result[#].lesson[#].title`

### Transformation

```javascript
var NestHydrationJS = require('nesthydrationjs')();
result = NestHydrationJS.nest(table, definition);
```

### Result

```javascript
[
    {id: 1, title: 'Tabular to Objects', required: true, teacher: {id: 1, name: 'David'}, lesson: [
        {id: 1, title: 'Defintions'},
        {id: 2, title: 'Table Data'},
        {id: 3, title: 'Objects'}
    ]},
    {id: 2, title: 'Column Names Define Structure', required: false, teacher: {id: 2, name: 'Chris'}, lesson: [
        {id: 4, title: 'Column Names'},
        {id: 2, title: 'Table Data'},
        {id: 3, title: 'Objects'}
    ]},
    {id: 3, title: 'Object On Bottom', required: false, teacher: {id: 1, name: 'David'}, lesson: [
        {id: 5, title: 'Non Array Input'}
    ]}
]
```

## SQL-ish Example

It is common to want to define an SQL query and then just get back objects. NestHydrationJS was created with this in mind.

The following example gives same result as above but a column naming convention is used instead of a definition object.

Nesting is achieved by using a underscore (`_`). A *x to one* relation is defined by a single underscore and a *x to many* relation is defined by preceeding properties of the many object with a 2nd underscore.

If a column alias ends in a triple underscore (`___`) followed by either `NUMBER` or `BOOLEAN` then the values in those columns will be caste to the respective type unless the value is null.  Triple underscore with `ID` (`___ID`) can be used to specify a column that is an id propery of that level of object. If an id is not specified the default is for the first column in that object to be the id property. The id specifier can be used in combination with a type caste, so either `___ID___NUMBER`, or `___NUMBER___ID` would be valid appends to a column name.

**Note:** that this means that almost always base level properties will be prefixed with a underscore, as this is actually a *x to many* relation from the variable returned from the `nest` function.

### Query

```javascript
var sql = ''
    + 'SELECT'
    + 'c.id        AS _id___NUMBER,'
    + 'c.title     AS _title,'
    + 'c.requried  AS _required___BOOLEAN,'
    + 't.teacher   AS _teacher_id___NUMBER,'
    + 't.name      AS _teacher_name,'
    + 'l.title     AS _lesson__title'
    + 'l.id        AS _lesson__id___NUMBER___ID,'
    + 'FROM course AS c'
    + 'JOIN teacher AS t ON t.id = c.teacher_id'
    + 'JOIN course_lesson AS cl ON cl.course_id = c.id'
    + 'JOIN lesson AS l ON l.id = cl.lesson_id'
;
```

For this example the following query produces the following tabular data.

**Note** that this is the same cell values as the `Tabular Data With Definition Object` example above but with different column names.

```javascript
var table = db.fetchAll(sql);
[
    {
        _id: '1', _title: 'Tabular to Objects', _required: '1',
        _teacher_id: '1', _teacher_name: 'David',
        _lesson__title: 'Defintions', _lesson__id: '1'
    },
    {
        _id: '1', _title: 'Tabular to Objects', _required: '1',
        _teacher_id: '1', _teacher_name: 'David',
        _lesson__title: 'Table Data', _lesson__id: '2'
    },
    {
        _id: '1', _title: 'Tabular to Objects', _required: '1',
        _teacher_id: '1', _teacher_name: 'David',
        _lesson__title: 'Objects', _lesson__id: '3'
    },
    {
        _id: '2', _title: 'Column Names Define Structure', _required: '0',
        _teacher_id: '2', _teacher_name: 'Chris',
        _lesson__title: 'Column Names', _lesson__id: '4'
    },
    {
        _id: '2', _title: 'Column Names Define Structure', _required: '0',
        _teacher_id: '2', _teacher_name: 'Chris',
        _lesson__title: 'Table Data', _lesson__id: '2'
    },
    {
        _id: '2', _title: 'Column Names Define Structure', _required: '0',
        _teacher_id: '2', _teacher_name: 'Chris',
        _lesson__title: 'Objects', _lesson__id: '3'
    },
    {
        _id: '3', _title: 'Object On Bottom', _required: '0',
        _teacher_id: '1', _teacher_name: 'David',
        _lesson__title: 'Non Array Input', _lesson__id: '5'
    }
]
```

### Transformation

```javascript
var NestHydrationJS = require('nesthydrationjs')();
result = NestHydrationJS.nest(table);
```

### Result

**Note** this is the same output as the `Tabular Data With Definition Object` example above.

```javascript
[
    {id: 1, title: 'Tabular to Objects', required: true, teacher: {id: 1, name: 'David'}, lesson: [
        {id: 1, title: 'Definitions'},
        {id: 2, title: 'Table Data'},
        {id: 3, title: 'Objects'}
    ]},
    {id: 2, title: 'Column Names Define Structure', required: false, teacher: {id: 2, name: 'Chris'}, lesson: [
        {id: 4, title: 'Column Names'},
        {id: 2, title: 'Table Data'},
        {id: 3, title: 'Objects'}
    ]},
    {id: 3, title: 'Object On Bottom', required: false, teacher: {id: 1, name: 'David'}, lesson: [
        {id: 5, title: 'Non Array Input'}
    ]}
]
```

## Additional Definition Object Capabilities

### Ids That Aren't First In Definition Properties

It is possible to specify an id column for mapping to objects instead of having it default to the first property of each object specified in the definition. If multiple properties for an object are specified to be ids only the first will be used.

```javascript
var NestHydrationJS = require('nesthydrationjs')();

var table = [
    {bookTitle: 'Anathem', bookId: 1, authorId: 1, authorName: 'Neal Stephenson'},
    {bookTitle: 'Seveneves', bookId: 2, authorId: 1, authorName: 'Neal Stephenson'}
];
var definition = [{
    name: {column: 'authorName'},
    id: {column: 'authorId', id: true},
    books: [{
        title: {column: 'bookTitle'},
        id: {column: 'bookId', id: true}
    }]
}];
result = NestHydrationJS.nest(table, definition);
/* result would be the following:
[
    {
        "name": "Neal Stephenson",
        "id": 1,
        "books": [
            {
                "title": "Anathem",
                "id": 1
            },
            {
                "title": "Seveneves",
                "id": 2
            }
        ]
    }
]
*/
```

### Default Values

You can specify a default value for a property by specifying the `default` property in the definition object. The value of the property will be replaced with the default value when it's row data is `null`.

#### Example

```javascript
var NestHydrationJS = require('nesthydrationjs')();

var table = [
    {
        id: 1, title: null
    }
];
var definition = [{
    id: 'id'
    title: {column: 'title', default: 'my default'},
}];
result = NestHydrationJS.nest(table, definition);
/* result would be the following:
[
    {id: 1, title: 'my default'}
]
*/
```

### Custom Type Definition

#### As a custom type

New types can be registered using the `registerType(name, handler)` function. `handler(cellValue, name, row)` is a callback function that takes the cell value, column name and the full row data.

##### Example Usage

```javascript
var NestHydrationJS = require('nesthydrationjs')();
NestHydrationJS.registerType('CUSTOM_TYPE', function(value, name, row) {
    return '::' + value + '::';
});

var table = [
    {
        id: 1, title: 'Custom Data Types'
    }
];
var definition = [{
    id: 'id'
    title: {column: 'title', type: 'CUSTOM_TYPE'},
}];
result = NestHydrationJS.nest(table, definition);
/* result would be the following:
[
    {id: 1, title: '::Custom Data Types::'}
]
*/
```

#### Type as a function

You can also define the type of a column in the definition object as a function and that function will be called for each value provided. The arguments passed are the same as those passed to a custom type handler. This allows formatting of a type without defining it as a global type.

##### Example

```javascript
var NestHydrationJS = require('nesthydrationjs')();

var table = [
    {
        id: 1, title: 'Custom Data Types'
    }
];
var definition = [{
    id: 'id'
    title: {column: 'title', type: function(value, name, row) {
        return '::' + value + '::';
    }},
}];
result = NestHydrationJS.nest(table, definition);
/* result would be the following:
[
    {id: 1, title: '::Custom Data Types::'}
]
*/
```

### Related Projects

- [NestHydration for PHP](https://github.com/CoursePark/NestHydration) : The original. But a new algorithm was implemented for the JS (this) version and ported back to PHP.
- [KnexNest](https://github.com/CoursePark/KnexNest) : Takes a [Knex.js](http://knexjs.org/) query object and returns objects.
