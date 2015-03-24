user-properties
===============

Library that help enforce user field properties.

More specifically, it is meant to retrieve implementation properties based on more fundamental ones.

I intend to use it to improve the flexibility, API quality and overall design of the user-store and express-user-local projects.

Requirements
============

- A recent version of Node.js (version 0.10.25 is installed on my machine) [1]

[1] Later versions should also work. If you find it not to be the case, let me know.

Installation
============

npm install user-properties

Running Tests
=============

In the directory where the module is located, run the following 2 commands on the prompt:

- npm install
- npm test

Usage
=====

Constructor
-----------

The library takes an object as input and returns a schema object.

The object should have the following structure:

```javascript
{'Field1': <Field1Properties>, 'Field2': <Field2Properties>, ..., 'FieldN': <FieldnProperties>}
```
The properties of each field are as follow:

- Required: Specify whether or not the field should exist for every user. It takes the boolean values of true or false.
- Unique: Specify whether or not the field should be unique to every user. It takes the boolean values of true or false.
- Privacy: Specifies how private the information in the field is. It can be Module.Privacy.Public, Module.Privacy.Private or Module.Privacy.Secret. Public means publicly available information (ex: Username), Private means restricted, but not secret information (ex: home address) and Secret means information that only the user should have easy access to (ex: password)
- Mutable: Specifies whether or not the information in the field should change. It takes the boolean values of true or false.
- Retrievable: Specifies whether or not the information in the field needs to be retrieved in its original format. It takes the boolean values of true or false.
- Description: Function that describes the field by returning true or false against a candidate value for the field. The candidate value is expected to be the single argument the function takes.
- Access: Method user has to retrieve the value of the property (ex: 'User', 'Email', 'Phone', etc). It takes the value of a string.
- Generators: Specifies what mecanisms are used to create/change the value of the field. It takes the value of an array of strings.

All the properties above, except 'Retrievable', 'Mutable', 'Description', 'Access', 'Privacy' and Generators default to false. 'Retrievable' and 'Mutable' default to true while 'Description' defaults to a function that always return true (ie, describes everything), 'Access' defaults to 'User' and 'Privacy' defaults to Public. Generators defaults to ['User'].

Calls
-----

- Instance.Validate(Field, Value)

Returns true if 'Value' returns true when passed to the 'Descriptor' of 'Field', else it returns false.

- Instance.ListComplement(Set)

Return all fields that are not present in 'Set'.

- Instance.ListHashable()

Returns an array of all fields that are hashable (not Retrievable and Privacy is not Public)

- Instance.ListLogin()

Returns an array of all fields that are suitable to login the user with (Required, Unique and Privacy is not Public)

- Instance.ListAuth(Source)

Returns an array of all fields that are suitable to authentify a given source (Private, Required, Privacy is Secret. If 'Source' is defined, Access===Source is also a requirement)

- Instance.ListID()

Returns an array of all fields that are suitable to uniquely identify a user (Required and Unique)

- Instance.List(Property, Value)

Returns an array of all fields whose defined by 'Property' is equal to the value defined by 'Value'. If no arguments are passed, all fields are returned.

- Instance.ListEditable(Source)

Returns an array of all the fields that are modifiable (Mutable). If 'Source' is defined, Access===Source is also a requirement.

- Module.ListIntersection(SetA, SetB)

Returns an array of all elements present in both SetA and SetB.

- Instance.ListIn(Field, Value)

Returns an array of all fields where 'Property' is an array-like container (ie, needs to have the 'some' method defined) which contains the value 'Value'. 

- Instance.ListPostable

Returns an array of all fields where an automated value could be generated after the field is initially created. This requires both 'Auto' to be listed in the field's generators and the field to be mutable.

Example
-------

I highly recommend you take a look at the test file to see how this library should be use.

The test file handles the classical case of a user that has the following fields: Username, Email, Password, Gender, Age and EmailToken.

Future
------

- Tests and doc for 'ListRestrictions' will follow once I integrate this library in the 'user-store' project.

- Potential new calls/properties as I find use for them

Versions History
================

1.0.0 
-----

Initial Release

1.1.0
-----

Added GenAll method.

1.2.0
-----

Added GenComplement method.

1.3.0
-----

Added 'Access' property and 'GenConfirm' method.

Added 'Source' verification to 'GenEditable' method.

1.4.0
-----

Added 'GenAccess' and 'GenIntersection' methods.

2.0.0
-----

- Condensed the 'Private' and 'Secret' properties into a single property called 'Privacy' which can be Public, Private or Secret.
- Condensed 'GenAuth' and 'GenConfirm' methods into a single method called 'ListAuth'
- Condensed 'GenPublic', 'GenRequired', 'GenAccess' and 'GenAll' methods into a single method called 'List' which takes arguments to differential the property you are intersted in.
- Refactored internal variable names for greater readability and correctness.
- Gave the following methods slightly more intuitive names:
- 'GenRestrictions' was renamed to 'GetRestrictions'
- 'GenHash' was renamed to 'ListHashable'
- 'GenComplement' was renamed to 'ListComplement'
- 'GenIntersection' was renamed to 'ListIntersection'
- 'GenAccess' was renamed to 'ListAccessible'
- 'GenRequired' was renamed to 'ListRequired'
- 'GenIdentify' was renamed to 'ListID'
- 'GenPublic' was renamed to 'ListPublic'
- 'GenLogin' was renamed to 'ListLogin'
- 'GenEditable' was renamed to 'ListEditable'

2.1.0
-----

- Added 'ListIn' and 'ListPostable' methods.
