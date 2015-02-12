//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/UserProperties/master/License.txt


var UserProperties = require('../lib/UserProperties');
var EmailRegex = require('regex-email');
var UsernameRegex = new RegExp("^[a-zA-Z][\\w\\+\\-\\.]{0,19}$");
var PasswordRegex = new RegExp("^.{8,20}$");

exports.Main = {
    'Main': function(Test) {
        Test.expect(10);
        var Properties = {'Username': {
                              'Required': true,
                              'Unique': true,
                              'Mutable': false,
                              'Description': function(Value) {return UsernameRegex.test(Value)}
                          },
                          'Email': {
                              'Required': true,
                              'Unique': true,
                              'Private': true,
                              'Description': function(Value) {return EmailRegex.test(Value)}
                          },
                          'Password': {
                              'Required': true,
                              'Private': true,
                              'Secret': true,
                              'Retrievable': false,
                              'Description': function(Value) {return PasswordRegex.test(Value)}
                          },
                          'Gender': {
                              'Private': true,
                              'Mutable': false,
                              'Description': function(Value) {return Value=='M'||Value=='F'} //Reality is more complex, but for the sake of this example...
                          },
                          'Age': {
                              'Private': true,
                              'Description': function(Value) {return typeof(Value)==typeof(1) && Value > 0}
                          },
                          'Address': {
                              'Required': true,
                              'Private': true
                          }};
                          
        var UserSchema = UserProperties(Properties);
        var Hashable = UserSchema.GenHash();
        var Loginable = UserSchema.GenLogin();
        var Authenticable = UserSchema.GenAuth();
        var Identifiable = UserSchema.GenIdentify();
        var Required = UserSchema.GenRequired();
        var Public = UserSchema.GenPublic();
        var Editable = UserSchema.GenEditable();
        var All = UserSchema.GenAll();
        var Empty = UserSchema.GenComplement(All);
        var NotRequired = UserSchema.GenComplement(Required);
        Test.ok(Hashable.length==1 && Hashable[0]=='Password', "Confirming GetHash works");
        Test.ok(Loginable.length==1 && Loginable[0]=='Email', "Confirming GetLogin works");
        Test.ok(Authenticable.length==1 && Authenticable[0]=='Password', "Confirming GenAuth works");
        Test.ok(Identifiable.length==2 && Identifiable.some(function(Item, Index, List) {return Item=='Email'}) && Identifiable.some(function(Item, Index, List) {return Item=='Username'}), "Confirming GenIdentify works");
        Test.ok(Required.length==4 && Required.some(function(Item, Index, List) {return Item=='Username'}) && Required.some(function(Item, Index, List) {return Item=='Email'}) && Required.some(function(Item, Index, List) {return Item=='Password'}) && Required.some(function(Item, Index, List) {return Item=='Address'}), "Confirming GenRequired works");
        Test.ok(Public.length==1 && Public[0]=='Username', "Confirming GenPublic works");
        Test.ok(Editable.length==4 && Editable.some(function(Item, Index, List) {return Item=='Age'}) && Editable.some(function(Item, Index, List) {return Item=='Email'}) && Editable.some(function(Item, Index, List) {return Item=='Password'}) && Editable.some(function(Item, Index, List) {return Item=='Address'}), "Confirming GenEditable works");
        Test.ok((!UserSchema.Validate('Gender', 'Male')) && UserSchema.Validate('Gender', 'F') && (!UserSchema.Validate('Age', '30')) && UserSchema.Validate('Age', 30), "Confirming validation works");
        Test.ok(All.length==6, "Confirming that GenAll works");
        Test.ok(Empty.length==0 && NotRequired.length==2, "Confirming that GenComplement works");
        Test.done();
    }
};
