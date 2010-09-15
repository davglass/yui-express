#!/usr/bin/env node

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    YUI = require('yui3').YUI;


YUI({ debug: false, filter: 'debug' }).use('express', 'node', function(Y) {

    var app = express.createServer();

    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyDecoder());
        app.use(express.cookieDecoder());        
        app.use(app.router);
        app.use(express.staticProvider(__dirname + '/assets'));
    });

    app.get('/combo', YUI.combo);

    app.register('.html', YUI);

    YUI.partials = [
        {
            name: 'layout_head',
            node: 'head'
        }
    ];

    YUI.configure(app, {
        yui2: '/yui2/',
        yui3: '/yui3/'
    });

    app.get('/', function(req, res){
        res.render('index.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'Home Page: Hello Word');
                }
            }
        });
    });

    app.get('/one', function(req, res){
        res.render('one.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'Page #1');
                    Y.all('#nav li').removeClass('selected');
                    Y.one('#nav li.one').addClass('selected');
                }
            }
        });
    });

    app.get('/two', function(req, res){
        res.render('two.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'Page #2');
                    Y.all('#nav li').removeClass('selected');
                    Y.one('#nav li.two').addClass('selected');
                }
            }
        });
    });

    app.get('/three', function(req, res){
        res.render('three.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'Page #3');
                    Y.all('#nav li').removeClass('selected');
                    Y.one('#nav li.three').addClass('selected');
                }
            }
        });
    });

    app.get('/calendar', function(req, res) {
        YUI().use('node', function(page) {
            window = page.Browser.window;
            document = page.Browser.document;
            navigator = page.Browser.navigator;

            page.one('body').append(page.Node.create('<div id="calCont"></div>'));
            page.one('body').addClass('yui-skin-sam');
            page.use('yui2-calendar', function() {
                var YAHOO = page.YUI2,
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
                    page.one('#cal .calheader .calnavright').set('href', '/calendar?page=' + next);
                    page.one('#cal .calheader .calnavleft').set('href', '/calendar?page=' + prev);
                    var as = page.all('#cal .calcell a');
                    page.log('Found: ' + as.size());
                    as.each(function(node) {
                        node.set('href', '/calendar/?month=' + (pageDate.getMonth() + 1) + '&year=' + pageDate.getFullYear() + '&day=' + node.get('innerHTML'));
                    });

                    var oom = page.all('#cal .calcell.oom');
                    oom.set('innerHTML', '');

                    Y.log('Done..');
                });
                cal1.render();


                res.render('calendar.html', {
                    locals: {
                        instance: page,
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
        });
    });

    app.get('/datatable', function(req, res) {
        YUI().use('node', function(page) {
            window = page.Browser.window;
            document = page.Browser.document;
            navigator = page.Browser.navigator;
            page.one('body').addClass('yui-skin-sam');

            page.use('yui2-datatable', 'yui2-datasource', function() {
                var YAHOO = page.YUI2;

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
                    var headers = page.all('#basic thead th a'),
                    dir = ((sortDir == 'desc') ? 'asc' : 'desc');

                    headers.each(function(n) {
                        var col = n.get('href').replace('yui-dt0-href-', '');
                        n.set('href', '/datatable?col=' + col + '&dir=' + dir);
                    });

                    res.render('datatable.html', {
                        locals: {
                            instance: page,
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
        });        
    });

    var diggCache = null;

    app.get('/digg', function(req, res) {
        YUI().use('node', 'io', function(page) {
            var ul = page.one('body').addClass('digg').appendChild(page.Node.create('<ul></ul>'));

            var sendRequest = function() {
                res.render('digg.html', {
                    locals: {
                        instance: page,
                        content: '#content',
                        sub: {
                            title: 'YUI/Express JS Demo'
                        },
                        after: function(Y, options, partial) {
                            Y.one('title').set('innerHTML', 'Digg Scrapping');
                            Y.all('#nav li').removeClass('selected');
                            Y.one('#nav li.digg').addClass('selected');
                        }
                    }
                });
            };

            if (diggCache) {
                //console.log('Loading Digg from cache');
                ul.set('innerHTML', diggCache);
                sendRequest();
            } else {
                //console.log('Fetching News');
                YUI().use('node', function(remotePage) {
                    
                    var url = 'http://digg.com/news';
                    
                    //This will call io under the hood and get the content of the URL,
                    //It will then dump the content of that page into this sandboxed document.
                    remotePage.fetch(url, function() {
                        //Get all the news items from the remote page.
                        var newsItems = remotePage.all('#story-items h3');
                        //Iterate them
                        newsItems.each(function(n) {
                            //Import this "A" node into the outside instances document
                            var a = ul.importNode(n.one('a'), true);
                            //Clean up the relative URL's of hrefs 
                            a.set('href', 'http://digg.com' + a.get('href'));
                            //Append the new node to the list
                            ul.appendChild(page.Node.create('<li></li>')).append(a);
                        });

                        diggCache = ul.get('innerHTML');
                        
                        sendRequest();

                        setTimeout(function() {
                            //console.log('clear digg cache');
                            diggCache = null;
                        }, (1000 * 60 * 5));

                    });
                });
            }
        });
    });

    app.get('/notice', function(req, res) {
        res.render('index.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'This is a notice'
                },
                after: function(Y) {
                    Y.one('#content').set('innerHTML', '<h1>Hello World, how are you?</h1>');
                    Y.one('#nav').remove();
                    Y.one('#doc').replaceClass('yui-t1', 'yui-t7');
                }
            }
        });
    });

    app.get('/tabview', function(req, res) {

        var selectedTab = 0;
        if (req.cookies.tabview) {
            selectedTab = req.cookies.tabview;
        }
        if (req.query.tab > -1) {
            selectedTab = req.query.tab;
        }

        YUI().use('tabview', 'yql', function(page) {
            var div = page.Node.create('<div id="demo"></div>');
            page.one('body').addClass('yui3-skin-sam').appendChild(div);
            
            page.log('Creating the TabView from script..');
            var tabview = new page.TabView({
                children: [{
                    label: 'foo',
                    content: '<p>foo content</p>'
                }, {
                    label: 'bar',
                    content: '<p>bar content</p>'
                }, {
                    label: 'baz',
                    content: '<p>baz content</p>'
                }]
            });
            
            tabview.render('#demo');
            var as = page.all('#demo .yui3-tab-label');
            as.each(function(v, k) {
                v.set('href', '/tabview?tab=' + k);
            });
            if (selectedTab) {
                tabview.selectChild(selectedTab);
            }

            res.render('tabview.html', {
                locals: {
                    instance: page,
                    use: ['tabview', 'cookie'],
                    //filter: 'debug',
                    content: '#content',
                    sub: {
                        title: 'YUI/Express JS Demo'
                    },
                    after: function(Y, options, partial) {
                        Y.Get.domScript('/tabview.js');
                        Y.one('title').set('innerHTML', 'YUI 3.x TabView');
                        Y.all('#nav li').removeClass('selected');
                        Y.one('#nav li.tabview').addClass('selected');
                    }
                }
            });
        });
    });

    app.get('/github/:id?', function(req, res) {
        var sql = "select * from github.repo.network where id='yui' and repo='yui3'";
        if (req.params.id) {
            sql = Y.Lang.sub("select * from github.user.info where id='{id}'", req.params);
        }
        
        YUI().use('yql', 'node', function(page) {
            var title = 'Github Followers';
            page.YQL(sql, function(r) {
                if (r.query.results.user) {
                    var parts = res.partial('github_member.html');
                    title = r.query.results.user.name;
                    parts = page.Lang.sub(parts, r.query.results.user);
                    page.one('body').append(parts);
                } else {
                    var parts = res.partial('github_list.html');
                    var ul = page.Node.create('<ul></ul>');
                    page.one('body').append(ul);
                    page.each(r.query.results.network.network, function(d) {
                        ul.append(page.Lang.sub(parts, d));
                    });
                }

                res.render('github.html', {
                    locals: {
                        instance: page,
                        content: '#content',
                        sub: {
                            title: 'YUI3 Github Network'
                        },
                        after: function(Y) {
                            Y.one('title').set('innerHTML', 'YUI3 Github Network');
                            Y.one('#content h1').set('innerHTML', title);
                            Y.all('#nav li').removeClass('selected');
                            Y.one('#nav li.github').addClass('selected');
                        }
                    }
                });
            });

        });
    });


    app.listen(3000);

});
    
