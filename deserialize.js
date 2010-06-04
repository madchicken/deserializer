/**    
 *    Deserialize forms serialized with the Prototype JavaScript framework (version 1.6.0)
 *    (c) 2005 Pierpaolo Follia <pfollia@gmail.com>
 *
 *    This cado is freely distributable under the terms of an MIT-style license.
 *
 *    For details, see the my web site: http://madchicken.altervista.org/tech/
 *
 *    Many thanks to:
 *      Wesley (http://blog.360.yahoo.com/wesleybrand)
 *      Gliebster (http://www.blogger.com/profile/16744179855302741518)
 *      krzak (http://www.blogger.com/profile/10667489476751566804)
 *      Art Harrison
 *      Joost Hietbrink
 *      Solgae
 *      and various anonymous
 *    for their help and bug fixing
 *
 *    Version 1.6.1
 */

Object.extend(Form, {
    deselectAll: function(form) {
        var elements = Form.getElements(form);
        for (var index = 0, len = elements.length; index < len; index++) {
            var item = elements[index];
            if(item.type.toLowerCase() === 'checkbox') {
                var checkboxs = Form.getInputs(item.form, 'checkbox', item.name);
                for(var i = 0, len = checkboxs.length; i < len; i++) {
                    checkboxs[i].checked = false;
                }
            } else if(item.tagName.toLowerCase() === 'select'){
                if(item.type === 'select-multiple') {
                    for(var index = 0, len = item.options.length; index < len; index++) {
                        item.options[index].selected = false;
                    }
                }
            }
        }
    },

    deserialize: function(form, data) {
        form = $(form);
        form.reset();
        Form.deselectAll(form);
        var tokens = data.split('&');

        tokens.each(
            function(data, index) {
                data = data.split('=');
                var id = decodeURIComponent(data[0]);
                var value = decodeURIComponent(data[1]);
                if(id != form.id && value)
                    Form.Element.deserialize(form, id, value);
            }
        );
    },
    
    deserializeJSON: function(form, data) {
        form = $(form);
        form.reset();
        Form.deselectAll(form);
        
        var json = data.evalJSON();
        for (var i in json) {
            var id = i;
            var value = json[i];
            if (id != form.id && value)
                Form.Element.deserialize(form, id, value);
        }
    }    
});

Object.extend(Form.Element, {
    deserialize: function(form, element, data) {
        var elements = Form.getElements(form);
        for (var index = 0, len = elements.length; index < len; ++index) {
            var item = elements[index];
            if(item.name == element) {
                var method = item.tagName.toLowerCase();
                Form.Element.Deserializers[method](item, data);
                break;
            }
        }
    }
});

Form.Element.Deserializers = {
    input: function(element, data) {
        switch (element.type.toLowerCase()) {
            case 'submit':
            case 'hidden':
            case 'password':
            case 'text':
                return Form.Element.Deserializers.textarea(element, data);
            case 'checkbox':
                return Form.Element.Deserializers.inputSelector(element, data);
            case 'radio':
                return Form.Element.Deserializers.radioSelector(element, data);
        }
        return false;
    },

    inputSelector: function(element, data) {
        var name = element.name;
        var checkboxs = Form.getInputs(element.form, 'checkbox', element.name);
        for(var i = 0, len = checkboxs.length; i < len; i++) {
            checkboxs[i].checked = true;
        }
    },

    radioSelector: function(element, data) {
        var name = element.name;
        var radiobuttons = Form.getInputs(element.form, 'radio', element.name);
        for(var i = 0, len = radiobuttons.length; i < len; i++) {
            var radiobutton = radiobuttons[i];
            if(radiobutton.value === data)
                radiobutton.checked = true;
        }
    },

    textarea: function(element, data) {
        element.value = data;
    },

    select: function(element, data) {
        return Form.Element.Deserializers[element.type === 'select-one' ?
            'selectOne' : 'selectMany'](element, data);
    },

    selectOne: function(element, data) {
        element.value = data;
    },

    selectMany: function(element, data) {
        if(data instanceof Array) {
            for(var k = 0, len = data.length; k < len; k++) {
                for(var i = 0, len = element.options.length; i < len; i++) {
                    var op = element.options[i];
                    if(op.value === decodeURIComponent(data[k])) {
                        op.selected = true;
                        break;
                    }
                }
            }
        } else {
            for(var i = 0, len = element.options.length; i < len; i++) {
                var op = element.options[i];
                if(op.value === decodeURIComponent(data)) {
                    op.selected = true;
                    break;
                }
            }
        }
    }

}
