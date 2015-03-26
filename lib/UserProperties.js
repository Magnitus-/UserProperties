//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/UserProperties/master/License.txt

function UserProperties(Fields)
{
    if(this instanceof UserProperties)
    {
        for(Field in Fields)
        {
            UserProperties.Defaults.forEach(function(Default, Index, List) {
                if(Fields[Field][Default[0]]===undefined)
                {
                    Fields[Field][Default[0]] = Default[1];
                }
            });
        }
        this.Fields = Fields;
    }
    else
    {
        return new UserProperties(Fields);
    }
}

UserProperties.Privacy = {'Public': 0, 'Private': 1, 'Secret': 2};

UserProperties.Defaults = [['Required', false],
                           ['Unique', false],
                           ['Privacy', UserProperties.Privacy.Public],
                           ['Mutable', true],
                           ['Retrievable', true],
                           ['Access', 'User'],
                           ['Description', function(Value) {return true}],
                           ['Sources', ['User']],
                           ['Generator', null]];

UserProperties.prototype.GetRestrictions = function() {
    var ToReturn = {};
    for(Field in this.Fields)
    {
        if(this.Fields[Field].Required||this.Fields[Field].Unique)
        {
            ToReturn[Field] = {};
            if(this.Fields[Field].Required)
            {
                ToReturn['NotNull']=1;
            }
            if(this.Fields[Field].Unique)
            {
                ToReturn['Unique']=1;
            }
        }
    }
    return ToReturn;
};

function Generator(Test)
{
    var ToReturn = [];
    for(Field in this.Fields)
    {
        if(Test(this.Fields, Field))
        {
            ToReturn.push(Field);
        }
    }
    return ToReturn;
}

UserProperties.prototype.List = function(Property, Value) {
    return Generator.call(this, function(Fields, Field) {
        if(Property!==undefined)
        {
            return(Fields[Field][Property]===Value);
        }
        else
        {
            return true;
        }
    });
}

UserProperties.prototype.ListIn = function(Property, Value) {
    return Generator.call(this, function(Fields, Field) {
        if(Fields[Field][Property]['some'])
        {
            return(Fields[Field][Property].some(function(Item, Index, List) {
                return Item===Value;
            }));
        }
        else
        {
            return false;
        }
    });
}

UserProperties.prototype.ListGeneratable = function() {
    var AutoFields = this.ListIn('Sources', 'Auto');
    var MutableFields = this.List('Mutable', true);
    return UserProperties.ListIntersection(AutoFields, MutableFields);
}

UserProperties.prototype.ListHashable = function() {
    return Generator.call(this, function(Fields, Field) {
        return((!Fields[Field].Retrievable)&&(Fields[Field].Privacy>=UserProperties.Privacy.Private));
    });
}

UserProperties.prototype.Generate = function(Field, Callback) {
    if(Callback)
    {
        if(this.Fields[Field].Generator)
        {
            this.Fields[Field].Generator(Callback)
        }
        else
        {
            Callback(new Error("UserProperties: "+Field+" has no generator."), null);
        }
    }
    else
    {
        if(this.Fields[Field].Generator)
        {
            return this.Fields[Field].Generator();
        }
        else
        {
            return null;
        }
    }
}

UserProperties.prototype.Validate = function(Field, Value) {
    if(Field in this.Fields)
    {
        if(this.Fields[Field].Description(Value))
        {
            return true;
        }
    }
    return false;
}

UserProperties.prototype.ListComplement = function(Set) {
    return Generator.call(this, function(Fields, Field) {
        return !(Set.some(function(Item, Index, List) {
            return Field==Item;
        }));
    });
};

UserProperties.ListIntersection = function(Set1, Set2) {
    var ToReturn = [];
    Set1.forEach(function(Set1Item) {
        if(Set2.some(function(Set2Item) {
            return Set2Item===Set1Item;
        }))
        {
            ToReturn.push(Set1Item);
        }
    });
    return ToReturn;
};

UserProperties.ListUnion = function(Set1, Set2) {
    var ToReturn = [];
    Set1.forEach(function(Set1Item) {
        ToReturn.push(Set1Item);
    });
    Set2.forEach(function(Set2Item) {
        if(!Set1.some(function(Set1Item) {
            return Set2Item===Set1Item;
        }))
        {
            ToReturn.push(Set2Item);
        }
    });
    return ToReturn;
};

UserProperties.prototype.ListID = function() {
    return Generator.call(this, function(Fields, Field) {
        return Fields[Field].Required && Fields[Field].Unique;
    });
};

UserProperties.prototype.ListLogin = function() {
    return Generator.call(this, function(Fields, Field) {
        return((Fields[Field].Privacy>=UserProperties.Privacy.Private) && Fields[Field].Required && Fields[Field].Unique);
    });
};

UserProperties.prototype.ListAuth = function(Source) {
    return Generator.call(this, function(Fields, Field) {
        if(!Source)
        {
            return((Fields[Field].Privacy===UserProperties.Privacy.Secret) && Fields[Field].Required);
        }
        else
        {
            return((Fields[Field].Privacy===UserProperties.Privacy.Secret) && Fields[Field].Required && (Fields[Field].Access===Source));
        }
    });
};

UserProperties.prototype.ListEditable = function(Source) {
    return Generator.call(this, function(Fields, Field) {
        if(!Source)
        {
            return Fields[Field].Mutable;
        }
        else
        {
            return Fields[Field].Mutable && (Fields[Field].Access===Source);
        }
    });
};

module.exports = UserProperties;
