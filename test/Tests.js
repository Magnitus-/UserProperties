//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/UserProperties/master/License.txt


var UserProperties = require('../lib/UserProperties');
var EmailRegex = require('regex-email');
var UsernameRegex = new RegExp("^[a-zA-Z][\\w\\+\\-\\.]{0,19}$");
var PasswordRegex = new RegExp("^.{8,20}$");

exports.Main = {
    'Main': function(Test) {
        Test.expect(14);
        var Fields = {'Username': {
                          'Required': true,
                          'Unique': true,
                          'Mutable': false,
                          'Description': function(Value) {return UsernameRegex.test(Value)}
                      },
                      'Email': {
                          'Required': true,
                          'Unique': true,
                          'Privacy': UserProperties.Privacy.Private,
                          'Description': function(Value) {return EmailRegex.test(Value)}
                      },
                      'Password': {
                          'Required': true,
                          'Privacy': UserProperties.Privacy.Secret,
                          'Retrievable': false,
                          'Description': function(Value) {return PasswordRegex.test(Value)}
                      },
                      'Gender': {
                          'Privacy': UserProperties.Privacy.Private,
                          'Mutable': false,
                          'Description': function(Value) {return Value=='M'||Value=='F'} //Reality is more complex, but for the sake of this example...
                      },
                      'Age': {
                          'Privacy': UserProperties.Privacy.Private,
                          'Description': function(Value) {return typeof(Value)==typeof(1) && Value > 0}
                      },
                      'Address': {
                          'Required': true,
                          'Privacy': UserProperties.Privacy.Private
                      },
                      'EmailToken': {
                          'Required': true,
                          'Privacy': UserProperties.Privacy.Secret,
                          'Access': 'Email'
                      }};
                          
        var UserSchema = UserProperties(Fields);
        var Hashable = UserSchema.ListHashable();
        var Loginable = UserSchema.ListLogin();
        var Authenticable = UserSchema.ListAuth();
        var Identifiable = UserSchema.ListID();
        var Required = UserSchema.List('Required', true);
        var Public = UserSchema.List('Privacy', UserProperties.Privacy.Public);
        var Editable = UserSchema.ListEditable();
        var All = UserSchema.List();
        var Empty = UserSchema.ListComplement(All);
        var NotRequired = UserSchema.ListComplement(Required);
        var ConfirmUser = UserSchema.ListAuth('User');
        var ConfirmEmail = UserSchema.ListAuth('Email');
        var UserEditable = UserSchema.ListEditable('User');
        var MailEditable = UserSchema.ListEditable('Email');
        var UserAccessible = UserSchema.List('Access', 'User');
        var EmailAccessible = UserSchema.List('Access', 'Email');
        var EmptyAgain = UserProperties.ListIntersection(UserAccessible, EmailAccessible);
        var IdentifiablePrivate = UserProperties.ListIntersection(Identifiable, UserSchema.ListComplement(Public));
        Test.ok(Hashable.length==1 && Hashable[0]=='Password', "Confirming ListHashable works");
        Test.ok(Loginable.length==1 && Loginable[0]=='Email', "Confirming ListLogin works");
        Test.ok(Authenticable.length==2 && Authenticable.some(function(Item, Index, List) {return Item=='Password'}) && Authenticable.some(function(Item, Index, List) {return Item=='EmailToken'}), "Confirming ListAuth works");
        Test.ok(Identifiable.length==2 && Identifiable.some(function(Item, Index, List) {return Item=='Email'}) && Identifiable.some(function(Item, Index, List) {return Item=='Username'}), "Confirming ListID works");
        Test.ok(Required.length==5 && Required.some(function(Item, Index, List) {return Item=='Username'}) && Required.some(function(Item, Index, List) {return Item=='Email'}) && Required.some(function(Item, Index, List) {return Item=='Password'}) && Required.some(function(Item, Index, List) {return Item=='Address'}) && Required.some(function(Item, Index, List) {return Item=='EmailToken'}), "Confirming List works with Required.");
        Test.ok(Public.length==1 && Public[0]=='Username', "Confirming List works with Privacy");
        Test.ok(Editable.length==5 && Editable.some(function(Item, Index, List) {return Item=='Age'}) && Editable.some(function(Item, Index, List) {return Item=='Email'}) && Editable.some(function(Item, Index, List) {return Item=='Password'}) && Editable.some(function(Item, Index, List) {return Item=='Address'}) && Editable.some(function(Item, Index, List) {return Item=='EmailToken'}), "Confirming ListEditable works");
        Test.ok((!UserSchema.Validate('Gender', 'Male')) && UserSchema.Validate('Gender', 'F') && (!UserSchema.Validate('Age', '30')) && UserSchema.Validate('Age', 30), "Confirming validation works");
        Test.ok(All.length==7, "Confirming that List with no arguments works");
        Test.ok(Empty.length==0 && NotRequired.length==2, "Confirming that ListComplement works");
        Test.ok(ConfirmUser.length==1&&ConfirmUser[0]=='Password'&&ConfirmEmail.length==1&&ConfirmEmail[0]=='EmailToken', "Confirming that ListAuth works with an argument.");
        var EditableWorks = UserEditable.length==4 && UserEditable.some(function(Item, Index, List) {return Item=='Age'}) && UserEditable.some(function(Item, Index, List) {return Item=='Email'}) && UserEditable.some(function(Item, Index, List) {return Item=='Password'}) && UserEditable.some(function(Item, Index, List) {return Item=='Address'});
        EditableWorks = EditableWorks && MailEditable.length==1 && MailEditable[0]=='EmailToken';
        Test.ok(EditableWorks, "Confirming that ListEditable works with an argument");
        Test.ok(UserAccessible.length==6 && (!UserEditable.some(function(Item, Index, List) {return Item=='EmailToken'})) && EmailAccessible.length==1 && EmailAccessible[0]=='EmailToken', "Confirming that List works with Accessible.");
        Test.ok(EmptyAgain.length==0 && IdentifiablePrivate.length==1 && IdentifiablePrivate[0]=='Email', "Confirming that ListIntersection works.");
        Test.done();
    }
};
