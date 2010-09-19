#!/usr/bin/env node

//Needed for monit/upstart
//Change directory into the script directory so includes resolve
process.chdir(__dirname);

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    YUI = require('yui3').YUI,
    DEBUG = true;

   
//Create the express application and allow the use of Spark (http://github.com/senchalabs/spark)
var app = module.exports = express.createServer();
/**
* Create the external instance that will host our "express" server.
* For a performance gain, you can "use" common modules here, so they 
* are available when a new instance is created per request.
*/
YUI({ debug: false }).use('express', 'node', function(Y) {
    
    //Configure it with some simple configuration options.
    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyDecoder());
        app.use(express.cookieDecoder());        
        app.use(app.router);
        app.use(express.staticProvider(__dirname + '/assets'));
    });
    
    //Set the development environment to debug, so YUI modues echo log statements
    app.configure('development', function(){
        DEBUG = true;
    });
    //Set the production environment to halt all debug logs.
    app.configure('production', function(){
        DEBUG = false;
    });
        
    /**
    * This version of the YUIExpress engine comes with a simple YUI combo handler
    * So you can put "use" inside your locals var on render:
    *
    * res.render('index.html', {
    *       locals: {
    *           use: ['dd', 'tabview']
    *       }
    * });
    *
    * This will load a URL into the page like this:
    * <script src="/combo?dd&tabview"></script>
    *
    * Note, currently it has to be "/combo", the internal renderer doesn't
    * know what you set this to. Eventually we can add it to YUI.configure.
    */
    app.get('/combo', YUI.combo);
    
    /**
    * This is the "black magic" part. This tells Express to use YUI to render
    * all HTML pages
    */
    app.register('.html', YUI);
    //The same as other Express View Engines
    //app.register('.html', require('jade'));
    //app.register('.haml', require('haml-js'));

    
    /**
    * These partials will be added to every page served by YUI, good for templating.
    * They can be added to by locals.partials on a per page basis. A partial looks like this:
    * {
    *   name: 'header', //Name of the /views/partial/{name}.html file to load
    *   method: 'append', //append,prepend,appendChild
    *   node: '#conent', //Any valid selector
    *   enum: 'one', //one,all
    *   fn: function //The callback function to run after the action.
    * }
    * Defaults to enum: "one" and method: "append"
    */

    YUI.partials = [
        {
            name: 'layout_head',
            node: 'head'
        }
    ];

    /**
    * YUI.configure allows you to configure routes for the yui2 & yui3 assests.
    * With this config you will serve yui2 assets from /yui2/ and yui3 assets from
    * /yui3
    * 
    */
    YUI.configure(app, {
        yui2: '/yui2/',
        yui3: '/yui3/'
    });

    /**
    * The route controller for the default page: /
    * This is a simple example of serving a static HTML page with a little
    * Javascript to enhance the page.
    */
    app.get('/', function(req, res) {
        //Render from ./views/index.html
        res.render('index.html', {
            //Locals used by the YUI renderer
            locals: {
                /**
                * This is the content placeholder in your ./views/layout.html file.
                * The content of index.html will be inserted here.
                */
                content: '#content',
                /**
                * Standard object hash to be passed to Y.Lang.sub after the
                * content has been loaded, but before it's inserted into the YUI
                * instance on render.
                */
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                /**
                * The after method will be invoked after the layout.html file
                * has been loaded into the instance. This allows you to change
                * the total layout, after all the peices have been assembled.
                */
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'YUI/Express JS Demo');
                }
            }
        });
    });
    
    /**
    * Pages 1, 2 & 3 are all the same HTML page template.
    * The simply change the content of that page after it's
    * loaded into the YUI instance. They use some of the same 
    * properties as the one above, only they also use the "before" method.
    */
    app.get('/one', function(req, res){
        res.render('same.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                /**
                * The before method is similar to the "after" method, only it's action is to
                * only deal with the content of the partial that was loaded. It allows you
                * to modify the partials HTML after that template was loaded into an instance.
                */
                before: function(Y) {
                    Y.one('h1').set('innerHTML', 'Welcome to Page #1');
                },
                after: function(Y, options, partial) {
                    //Set the title of the page
                    Y.one('title').set('innerHTML', 'Page #1');
                    //Update the nav and remove all selected nav items
                    Y.all('#nav li').removeClass('selected');
                    //Grab the one for page one and add selected.
                    Y.one('#nav li.one').addClass('selected');
                }
            }
        });
    });

    app.get('/two', function(req, res){
        res.render('same.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                before: function(Y) {
                    Y.one('h1').set('innerHTML', 'Welcome to Page #2');
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
        res.render('same.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'YUI/Express JS Demo'
                },
                before: function(Y) {
                    Y.one('h1').set('innerHTML', 'Welcome to Page #3');
                },
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'Page #3');
                    Y.all('#nav li').removeClass('selected');
                    Y.one('#nav li.three').addClass('selected');
                }
            }
        });
    });
    
    /**
    * This handler does a couple special things.
    *   Uses an external module (CODE REUSE)
    *   Uses YUI2
    *   Handles user action from requests
    */
    app.get('/calendar', function(req, res) {
        YUI({
            debug: DEBUG,
            modules: {
                'local-cal': {
                    //For more detail see this file..
                    fullpath: __dirname + '/modules/local-cal.js'
                }
            }
        }).use('node', 'local-cal', function(page) {
            //Calling a method inside an external module
            page.localCal(req, res);
        });
    });
    /**
    * This handler is similar to the /calendar, but it renders a DataTable instead.
    */
    app.get('/datatable', function(req, res) {
        YUI({
            debug: DEBUG,
            modules: {
                'local-dt': {
                    fullpath: __dirname + '/modules/local-dt.js'
                }
            },
        }).use('node', 'local-dt', function(page) {
            //Calling a method inside an external module
            page.localDT(req, res);

        });        
    });

    var diggCache = null;

    app.get('/digg', function(req, res) {
        YUI({ debug: DEBUG }).use('node', 'io', function(page) {
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
                YUI({ debug: DEBUG }).use('node', function(remotePage) {
                    
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
        res.render('notice.html', {
            locals: {
                content: '#content',
                sub: {
                    title: 'This is a notice'
                },
                after: function(Y) {
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

        YUI({ debug: DEBUG }).use('tabview', 'yql', function(page) {
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
        
        YUI({ debug: DEBUG }).use('yql', 'node', function(page) {
            var title = 'Github YUI Followers';
            page.YQL(sql, function(r) {
                if (r.query.results.user) {
                    var parts = res.partial('github_member.html');
                    title = r.query.results.user.name;
                    parts = page.Lang.sub(parts, r.query.results.user);
                    page.one('body').append(parts);
                    var lis = page.all('#member li');
                    lis.each(function(n) {
                        //Need a sub method that fixes this stuff...
                        if (n.get('innerHTML').indexOf('Object') > -1) {
                            n.remove();
                        }
                        if (n.get('innerHTML').indexOf('{') > -1) {
                            n.remove();
                        }
                        if (n.get('innerHTML').indexOf('null') > -1) {
                            n.remove();
                        }
                    });
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


    app.listen(3200);
    if (DEBUG) {
        console.log('Server running at: http://localhost:3200/');
    }

});
    
