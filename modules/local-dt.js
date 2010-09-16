YUI.add('local-dt', function(Y) {
    Y.log('LOCALDT LOADED');
    Y.localDT = function(req, res) {
        
        window = Y.Browser.window;
        document = Y.Browser.document;
        navigator = Y.Browser.navigator;
        Y.one('body').addClass('yui-skin-sam');

        Y.use('yui2-datatable', 'yui2-datasource', function() {
            var YAHOO = Y.YUI2;

            var el = document.createElement('div');
            el.id = 'basic';
            document.body.appendChild(el);

            var config = {},
                sortCol = 'date',
                sortDir = 'desc';
    
            if (req.query.col) {
                sortCol = req.query.col;
            }
            if (req.query.dir) {
                sortDir = req.query.dir;
            }

            config.sortedBy = {
                key: sortCol,
                dir: ((sortDir == 'asc') ? YAHOO.widget.DataTable.CLASS_ASC : YAHOO.widget.DataTable.CLASS_DESC)
            };

            YAHOO.example.Data = {
                bookorders: [
                    {id:"po-0167", date:new Date(1980, 2, 24), quantity:1, amount:4, title:"A Book About Nothing"},
                    {id:"po-0783", date:new Date("January 3, 1983"), quantity:null, amount:12.12345, title:"The Meaning of Life"},
                    {id:"po-0297", date:new Date(1978, 11, 12), quantity:12, amount:1.25, title:"This Book Was Meant to Be Read Aloud"},
                    {id:"po-1482", date:new Date("March 11, 1985"), quantity:6, amount:3.5, title:"Read Me Twice"}
                ]
            };
            var aReturn = -1, bReturn = 1;
            if (sortDir == 'desc') {
                aReturn = 1;
                bReturn = -1;
            }
            YAHOO.example.Data.bookorders.sort(function(a, b) {
                var A = a[sortCol], B = b[sortCol];
                if (A < B) {//sort string ascending
                    return aReturn;
                }
                if (A > B) {
                    return bReturn;
                }
                return 0 //default return value (no sorting)
            });
            
            
            var myColumnDefs = [
                { key: "id", sortable: true },
                { key: "date", formatter: YAHOO.widget.DataTable.formatDate, sortable: true },
                { key: "quantity", formatter: YAHOO.widget.DataTable.formatNumber, sortable: true },
                { key: "amount", formatter: YAHOO.widget.DataTable.formatCurrency, sortable: true },
                { key: "title", sortable: true }
            ];

            Y.log('Creating DataSource..');

            var myDataSource = new YAHOO.util.DataSource(YAHOO.example.Data.bookorders);
            myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
            
            myDataSource.responseSchema = {
                fields: [ "id", "date", "quantity", "amount", "title" ]
            };

            Y.log('Creating DataTable..');


            var myDataTable = new YAHOO.widget.DataTable("basic", myColumnDefs, myDataSource, config);
            myDataTable.on('renderEvent', function() {
                var headers = Y.all('#basic thead th a'),
                dir = ((sortDir == 'desc') ? 'asc' : 'desc');

                headers.each(function(n) {
                    var col = n.get('href').replace('yui-dt0-href-', '');
                    n.set('href', '/datatable?col=' + col + '&dir=' + dir);
                });

                res.render('datatable.html', {
                    locals: {
                        instance: Y,
                        content: '#content',
                        sub: {
                            title: 'YUI/Express JS Demo'
                        },
                        after: function(Y, options, partial) {
                            Y.one('title').set('innerHTML', 'YUI 2 Datatable');
                            Y.all('#nav li').removeClass('selected');
                            Y.one('#nav li.datatable').addClass('selected');
                        }
                    }
                });
                
            });
        });

    }


});
