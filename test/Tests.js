//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/UserProperties/master/License.txt

var UserProperties = require('../lib/UserProperties');
var EmailRegex = require('regex-email');
var UsernameRegex = new RegExp("^[a-zA-Z][\\w\\+\\-\\.]{0,19}$");
var PasswordRegex = new RegExp("^.{8,20}$");
var Uid = require('uid-safe').sync;

function SyncGen()
{
    return Uid(15);
}

//Redundant here, but needed to test async signature
function AsyncGen(Callback)
{
    Callback(null, Uid(15));
}

function In()
{
    var InList = arguments[0];
    var CheckList = Array.prototype.slice.call(arguments, 1);
    return(CheckList.every(function(CheckItem) {
        return(InList.some(function(RefItem) {
            return RefItem===CheckItem;
        }));
    }));
}

function ParseInt(Value)
{
    var Result = Number(Value);
    if(!Number.isNaN(Result))
    {
        return Result;
    }
    else
    {
        return null;
    }
}

function GenderStr(Value)
{
    if(Value==='M')
    {
        return 'Male';
    }
    else if(Value==='F')
    {
        return 'Female';
    }
    else
    {
        return 'Unknown';
    }
}

exports.Main = {
    'Main': function(Test) {
        Test.expect(29);
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
                          'Description': function(Value) {return PasswordRegex.test(Value)},
                          'Sources': ['User', 'Auto'],
                          'Generator': SyncGen
                      },
                      'Gender': {
                          'Privacy': UserProperties.Privacy.Private,
                          'Mutable': false,
                          'Description': function(Value) {return Value=='M'||Value=='F'}, //Reality is more complex, but for the sake of this example...
                          'Stringify': GenderStr
                      },
                      'Age': {
                          'Privacy': UserProperties.Privacy.Private,
                          'Description': function(Value) {return typeof(Value)==typeof(1) && Value > 0},
                          'Parse': ParseInt
                      },
                      'Address': {
                          'Required': true,
                          'Privacy': UserProperties.Privacy.Private
                      },
                      'EmailToken': {
                          'Required': true,
                          'Privacy': UserProperties.Privacy.Secret,
                          'Access': 'Email',
                          'Sources': ['Auto'],
                          'Generator': AsyncGen
                      }};
                          
        var UserSchema = UserProperties(Fields);
        var Hashable = UserSchema.ListHashable();
        var Loginable = UserSchema.ListLogin();
        var UserLoginable = UserSchema.ListLogin('User');
        var EmailLoginable = UserSchema.ListLogin('Email');
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
        var AutoGenerateable = UserSchema.ListIn('Sources', 'Auto');
        var UserGenerateable = UserSchema.ListIn('Sources', 'User');
        var Postable = UserSchema.ListGeneratable();
        var RequiredNotMutable = UserProperties.ListUnion(Required, UserSchema.List('Mutable', false));
        var GeneratedNull = UserSchema.Generate('Address');
        var GeneratedPass = UserSchema.Generate('Password');
        var GeneratedToken = null;
        UserSchema.Generate('EmailToken', function(Err, Value) {
            var GeneratedToken = Value;
            Test.ok(Hashable.length===1 && Hashable[0]==='Password', "Confirming ListHashable works");
            Test.ok(Loginable.length===1 && Loginable[0]==='Email', "Confirming ListLogin works");
            Test.ok(UserLoginable.length===1 && UserLoginable[0]==='Email' && EmailLoginable.length===0, "Confirming ListLogin with an argument works");
            Test.ok(Authenticable.length==2 && In(Authenticable, 'Password', 'EmailToken'), "Confirming ListAuth works");
            Test.ok(Identifiable.length==2 && In(Identifiable, 'Email', 'Username'), "Confirming ListID works");
            Test.ok(Required.length==5 && In(Required, 'Username', 'Email', 'Password', 'Address', 'EmailToken'), "Confirming List works with Required.");
            Test.ok(Public.length==1 && Public[0]=='Username', "Confirming List works with Privacy");
            Test.ok(Editable.length==5 && In(Editable, 'Age', 'Email', 'Password', 'Address', 'EmailToken'), "Confirming ListEditable works");
            Test.ok((!UserSchema.Validate('Gender', 'Male')) && UserSchema.Validate('Gender', 'F') && (!UserSchema.Validate('Age', '30')) && UserSchema.Validate('Age', 30), "Confirming validation works");
            Test.ok(All.length==7, "Confirming that List with no arguments works");
            Test.ok(Empty.length==0 && NotRequired.length==2, "Confirming that ListComplement works");
            Test.ok(ConfirmUser.length==1&&ConfirmUser[0]=='Password'&&ConfirmEmail.length==1&&ConfirmEmail[0]=='EmailToken', "Confirming that ListAuth works with an argument.");
            var EditableWorks = UserEditable.length==4 && In(UserEditable, 'Age', 'Email', 'Password', 'Address');
            EditableWorks = EditableWorks && MailEditable.length==1 && MailEditable[0]=='EmailToken';
            Test.ok(EditableWorks, "Confirming that ListEditable works with an argument");
            Test.ok(UserAccessible.length==6 && (!In(UserAccessible, 'EmailToken')) && EmailAccessible.length==1 && EmailAccessible[0]=='EmailToken', "Confirming that List works with Accessible.");
            Test.ok(EmptyAgain.length==0 && IdentifiablePrivate.length==1 && IdentifiablePrivate[0]=='Email', "Confirming that ListIntersection works.");
            Test.ok(AutoGenerateable.length===2 && In(AutoGenerateable, 'EmailToken', 'Password') && UserGenerateable.length===6 && (!In(UserGenerateable, 'EmailToken')), "Confirming that ListIn works. ");
            Test.ok(Postable.length===2 && In(Postable, 'EmailToken', 'Password'), "Confirming that ListPostable works.");
            Test.ok(RequiredNotMutable.length===6 && In(RequiredNotMutable, 'Username', 'Email', 'Password', 'Gender', 'Address', 'EmailToken'), "Confirming that ListUnion works.");
            Test.ok(UserSchema.Is('Username', 'Required', true) && (!UserSchema.Is('Email', 'Unique', false)) && UserSchema.Is('EmailToken', 'Access', 'Email') && (!UserSchema.Is('Username', 'Access', 'Email')), "Confirming that Is works with 3 arguments");
            Test.ok(UserSchema.Is('EmailToken', {'Required': true, 'Privacy': UserProperties.Privacy.Secret, 'Access': 'Email'}) && (!UserSchema.Is('EmailToken', {'Required': true, 'Privacy': UserProperties.Privacy.Secret, 'Access': 'User'})), "Confirming that Is works with 2 arguments");
            Test.ok(UserSchema.In('Password', 'Sources', 'Auto') && UserSchema.In('Password', 'Sources', 'User') && (!UserSchema.In('Password', 'Sources', 'NotThere')), "Confirming that In works");
            Test.ok(UserSchema.Stringify('Username', 'Magnitus') === 'Magnitus' && UserSchema.Stringify('Email', []) === '[]' && UserSchema.Stringify('Gender', 'M') === 'Male', "Confirming that Stringify method works.");
            Test.ok(UserSchema.Parse('Username', 'Magnitus') === 'Magnitus' && typeof(UserSchema.Parse('Email', [])) === typeof([]) && UserSchema.Parse('Age', '11') === 11 && UserSchema.Parse('Age', 'abc') === null, "Confirming that Parse method works.");
            Test.ok(UserSchema.Validate('Age', 11, true) && UserSchema.Validate('Age', '11', true) && (!UserSchema.Validate('Age', 'abc', true)) && UserSchema.Validate('Gender', 'F', true) && (!UserSchema.Validate('Gender', 'abc', true)), "Confirming that Validate method with parsing flagged works.");
            Test.ok(UserSchema.Parse('abc', 1) ===  null && UserSchema.Stringify('abc', 1) ===  null && (!UserSchema.Validate('abc', 1)) && (!UserSchema.Validate('abc', 1, true)), "Confirming that methods with unexistent fields are handled properly, part 1.");
            Test.ok((!UserSchema.Is('abc', 'Required', true)) && (!UserSchema.Is('abc', {'Required': true, 'Privacy': UserProperties.Privacy.Secret, 'Access': 'Email'})) && (!UserSchema.In('abc', 'Sources', 'Auto')), "Confirming that methods with unexistent fields are handled properly, part 2.");
            Test.ok(UserSchema.Generate('abc') === null, "Confirming that sync Generate with unexistent fields is handled properly.");
            UserSchema.Generate('Gender', function(Err, Value) {
                Test.ok(GeneratedNull===null && typeof(GeneratedPass) === typeof('') && GeneratedPass.length === 20 && typeof(GeneratedToken) === typeof('') && GeneratedToken.length === 20 && Err, "Confirming that Generate works.");
                UserSchema.Generate('abc', function(Err, Value) {
                    Test.ok(Err, "Confirming that async Generate with unexistent fields is handled properly.");
                    Test.done();
                });
            });
        });
    }
};
