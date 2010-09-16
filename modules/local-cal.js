YUI.add('local-cal', function(Y) {

    Y.localCal = function(req, res) {
        window = Y.Browser.window;
        document = Y.Browser.document;
        navigator = Y.Browser.navigator;

        Y.one('body').append(Y.Node.create('<div id="calCont"></div>'));
        Y.one('body').addClass('yui-skin-sam');
        Y.use('yui2-calendar', function() {
            var YAHOO = Y.YUI2,
                config = {};

            if (req.query) {
                var q = req.query;
                if (q.day && q.month && q.year) {
                    config.pagedate = q.month + '/' + q.year;
                    config.selected = q.month + '/' + q.day + '/' + q.year;
                }
                if (q.page) {
                    config.pagedate = q.page;
                }
            }
            
            var cal1 = new YAHOO.widget.Calendar('cal', "calCont", config);
            cal1.HIDE_BLANK_WEEKS = true;
            cal1.renderEvent.subscribe(function() {
                var pageDate = cal1.cfg.getProperty('pagedate');
                var next = YAHOO.widget.DateMath.add(pageDate, 'M', 1);
                var prev = YAHOO.widget.DateMath.subtract(pageDate, 'M', 1);
                next = (next.getMonth() + 1) + '/' + next.getFullYear();
                prev = (prev.getMonth() + 1) + '/' + prev.getFullYear();

                //Fix up the dom
                Y.one('#cal .calheader .calnavright').set('href', '/calendar?page=' + next);
                Y.one('#cal .calheader .calnavleft').set('href', '/calendar?page=' + prev);
                var as = Y.all('#cal .calcell a');
                Y.log('Found: ' + as.size());
                as.each(function(node) {
                    node.set('href', '/calendar/?month=' + (pageDate.getMonth() + 1) + '&year=' + pageDate.getFullYear() + '&day=' + node.get('innerHTML'));
                });

                var oom = Y.all('#cal .calcell.oom');
                oom.set('innerHTML', '');

                Y.log('Done..');
            });
            cal1.render();


            res.render('calendar.html', {
                locals: {
                    instance: Y,
                    content: '#content',
                    sub: {
                        title: 'YUI/Express JS Demo'
                    },
                    after: function(Y, options, partial) {
                        Y.one('title').set('innerHTML', 'YUI 2 Calendar');
                        Y.all('#nav li').removeClass('selected');
                        Y.one('#nav li.calendar').addClass('selected');
                    }
                }
            });
        });

    }

});
