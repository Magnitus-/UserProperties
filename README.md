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

- Required: Specify whether or not the field should exist for every user.
- Unique: Specify whether or not the field should be unique to every user.
- Private: Specifies whether or not the value of the field shouldn't be immediately availabe to everyone
- Secret: Specifies whether or not the information in the field should be known only to the user and should be very hard to figure out
- Mutable: Specifies whether or not the information in the field should change
- Retrievable: Specifies whether or not the information in the field needs to be retrieved in its original format
- Description: Function that describes the field by returning true or false against a candidate value for the field
- Access: Method user has to retrieve the value of the property (ex: 'Self', 'Email', 'Phone', etc).

All the properties above, except 'Retrievable', 'Mutable', 'Description' and 'Access' default to false. 'Retrievable' and 'Mutable' default to true while 'Description' defaults to a function that always return true (ie, describes everything) and 'Access' defaults to 'User'.

Calls
-----

- Instance.Validate(Field, Value)

Returns true if 'Value' returns true when passed to the 'Descriptor' of 'Field', else it returns false.

- Instance.GenAll()

Returns an array of all fields

- Instance.GenComplement(Set)

Return all fields that are not present in 'Set'.

- Instance.GenHash()

Returns an array of all fields that are hashable (not Retrievable and Private)

- Instance.GenLogin()

Returns an array of all fields that are suitable to login the user with (Private, Required and Unique)

- Instance.GenAuth()

Returns an array of all fields that are suitable to authentify a user (Private, Required and Secret)

DEPRECATION: This method is made redundant by the more precice GenConfirm method which should be preferred. 

- Instance.GenIdentify()

Returns an array of all fields that are suitable to uniquely identify a user (Required and Unique)

- Instance.GenRequired()

Returns an array of all the fields a user registering would need (Required)

- Instance.GenPublic()

Returns an array of all the fields that are publicly accessible (not Private)

- Instance.GenEditable(Source)

Returns an array of all the fields that are modifiable (Mutable). If 'Source' is defined, Access===Source is also a requirement.

- Instance.GenConfirm(Source)

Returns an array of all fields that confirm that the user has access to 'Source' (Private, Required, Secret, Access===Source) 

Future
------

- Examples will follow. Look at Test.js file for examples in the meanwhile.

- Tests and doc for 'GenRestrictions' will follow

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
