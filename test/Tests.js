//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/UserProperties/master/License.txt


var UserProperties = require('../lib/UserProperties');
var EmailRegex = require('regex-email');
var UsernameRegex = new RegExp("^[a-zA-Z][\\w\\+\\-\\.]{0,19}$");
var PasswordRegex = new RegExp("^.{8,20}$");

exports.Main = {
    'Main': function(Test) {
        Test.expect(12);
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
                          },
                          'EmailToken': {
                              'Required': true,
                              'Private': true,
                              'Secret': true,
                              'Access': 'Email'
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
        var ConfirmUser = UserSchema.GenConfirm('User');
        var ConfirmEmail = UserSchema.GenConfirm('Email');
        var UserEditable = UserSchema.GenEditable('User');
        var MailEditable = UserSchema.GenEditable('Email');
        Test.ok(Hashable.length==1 && Hashable[0]=='Password', "Confirming GetHash works");
        Test.ok(Loginable.length==1 && Loginable[0]=='Email', "Confirming GetLogin works");
        Test.ok(Authenticable.length==2 && Authenticable.some(function(Item, Index, List) {return Item=='Password'}) && Authenticable.some(function(Item, Index, List) {return Item=='EmailToken'}), "Confirming GenAuth works");
        Test.ok(Identifiable.length==2 && Identifiable.some(function(Item, Index, List) {return Item=='Email'}) && Identifiable.some(function(Item, Index, List) {return Item=='Username'}), "Confirming GenIdentify works");
        Test.ok(Required.length==5 && Required.some(function(Item, Index, List) {return Item=='Username'}) && Required.some(function(Item, Index, List) {return Item=='Email'}) && Required.some(function(Item, Index, List) {return Item=='Password'}) && Required.some(function(Item, Index, List) {return Item=='Address'}) && Required.some(function(Item, Index, List) {return Item=='EmailToken'}), "Confirming GenRequired works");
        Test.ok(Public.length==1 && Public[0]=='Username', "Confirming GenPublic works");
        Test.ok(Editable.length==5 && Editable.some(function(Item, Index, List) {return Item=='Age'}) && Editable.some(function(Item, Index, List) {return Item=='Email'}) && Editable.some(function(Item, Index, List) {return Item=='Password'}) && Editable.some(function(Item, Index, List) {return Item=='Address'}) && Editable.some(function(Item, Index, List) {return Item=='EmailToken'}), "Confirming GenEditable works");
        Test.ok((!UserSchema.Validate('Gender', 'Male')) && UserSchema.Validate('Gender', 'F') && (!UserSchema.Validate('Age', '30')) && UserSchema.Validate('Age', 30), "Confirming validation works");
        Test.ok(All.length==7, "Confirming that GenAll works");
        Test.ok(Empty.length==0 && NotRequired.length==2, "Confirming that GenComplement works");
        Test.ok(ConfirmUser.length==1&&ConfirmUser[0]=='Password'&&ConfirmEmail.length==1&&ConfirmEmail[0]=='EmailToken', "Confirming that GenConfirm works");
        var EditableWorks = UserEditable.length==4 && UserEditable.some(function(Item, Index, List) {return Item=='Age'}) && UserEditable.some(function(Item, Index, List) {return Item=='Email'}) && UserEditable.some(function(Item, Index, List) {return Item=='Password'}) && UserEditable.some(function(Item, Index, List) {return Item=='Address'});
        EditableWorks = EditableWorks && MailEditable.length==1 && MailEditable[0]=='EmailToken';
        Test.ok(EditableWorks, "Confirming that GenEditable works with an argument");
        Test.done();
    }
};
