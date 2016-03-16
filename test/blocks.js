BEM.DOM.decl('block2', {
    onSetMod: {
        js: {
            inited: function() {
                console.log('block2 inited');
            }
        }
    },
    onElemSetMod: {
        elem: {
            m1: function() {
                console.log('block2 elem mod m1 changed')
            }
        }
    }
});

BEM.DOM.init($('body'));
