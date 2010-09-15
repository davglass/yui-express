YUI({ fetchCSS: false }).use('tabview', 'cookie', function(Y) {
    new Y.TabView({
        srcNode: '#demo .yui3-tabview-content'
    }).render().after('selectionChange', function(e) {
        Y.Cookie.set('tabView', e.newVal.get('index'));
    });
});
