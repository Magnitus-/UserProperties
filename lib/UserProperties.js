//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/UserProperties/master/License.txt

function UserProperties(Properties)
{
    if(this instanceof UserProperties)
    {
        for(Property in Properties)
        {
            UserProperties.Defaults.forEach(function(Default, Index, List) {
                if(typeof(Properties[Property][Default[0]])!=typeof(Default[1]))
                {
                    Properties[Property][Default[0]] = Default[1];
                }
            });
        }
        this.Properties = Properties;
    }
    else
    {
        return new UserProperties(Properties);
    }
}

UserProperties.Defaults = [['Required', false],
                           ['Unique', false],
                           ['Private', false],
                           ['Secret', false],
                           ['Mutable', true],
                           ['Retrievable', true],
                           ['Description', function(Value) {return true}]];

UserProperties.prototype.GenRestrictions = function() {
    var ToReturn = {};
    for(Field in this.Properties)
    {
        if(this.Properties[Field].Required||this.Properties[Field].Unique)
        {
            ToReturn[Field] = {};
            if(this.Properties[Field].Required)
            {
                ToReturn['NotNull']=1;
            }
            if(this.Properties[Field].Unique)
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
    for(Field in this.Properties)
    {
        if(Test(this.Properties, Field))
        {
            ToReturn.push(Field);
        }
    }
    return ToReturn;
}

UserProperties.prototype.GenHash = function(Field, Value) {
    return Generator.call(this, function(Properties, Field) {
        return((!Properties[Field].Retrievable)&&Properties[Field].Private);
    });
}

UserProperties.prototype.Validate = function(Field, Value) {
    if(Field in this.Properties)
    {
        if(this.Properties[Field].Description(Value))
        {
            return true;
        }
    }
    return false;
}

UserProperties.prototype.GenRequired = function() {
    return Generator.call(this, function(Properties, Field) {
        return Properties[Field].Required;
    });
};

UserProperties.prototype.GenIdentify = function() {
    return Generator.call(this, function(Properties, Field) {
        return Properties[Field].Required&&Properties[Field].Unique;
    });
};

UserProperties.prototype.GenPublic = function() {
    return Generator.call(this, function(Properties, Field) {
        return(!Properties[Field].Private);
    });
};

UserProperties.prototype.GenLogin = function() {
    return Generator.call(this, function(Properties, Field) {
        return(Properties[Field].Private&&Properties[Field].Required&&Properties[Field].Unique);
    });
};

UserProperties.prototype.GenAuth = function() {
    return Generator.call(this, function(Properties, Field) {
        return(Properties[Field].Private&&Properties[Field].Required&&Properties[Field].Secret);
    });
};

UserProperties.prototype.GenEditable = function() {
    return Generator.call(this, function(Properties, Field) {
        return Properties[Field].Mutable;
    });
};

module.exports = UserProperties;
