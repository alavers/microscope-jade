Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    waitOn: function() {
        return [Meteor.subscribe('notifications')];
    }
});

PostsListController = RouteController.extend({
    template: 'postsList',
    increment: 5,
    limit: function() {
        return parseInt(this.params.postsLimit) || this.increment;
    },
    findOptions: function() {
        return {
            sort: {
                submitted: -1
            },
            limit: this.limit()
        };
    },
    posts: function() {
        return Posts.find({}, this.findOptions());
    },
    waitOn: function() {
        return Meteor.subscribe('posts', this.findOptions());
    },
    data: function() {
        var hasMore = this.posts().count() === this.limit();
        var nextPath = this.route.path({
            postsLimit: this.limit() + this.increment
        });
        return {
            posts: this.posts(),
            nextPath: hasMore ? nextPath : null
        };
    }
});

Router.map(function() {
    this.route('postPage', {
        path: '/posts/:_id',
        controller: PostsListController
    });

    this.route('postSubmit', {
        path: '/submit'
    });

    this.route('postEdit', {
        path: '/edit/:_id',
        data: function() {
            return Posts.findOne(this.params._id);
        }
    });

    this.route('postsList', {
        path: '/:postsLimit?',
        waitOn: function() {
            var limit = parseInt(this.params.postsLimit) || 5;
            return Meteor.subscribe('posts', {
                sort: {
                    submitted: -1
                },
                limit: limit
            });
        },
        data: function() {
            var limit = parseInt(this.params.postsLimit) || 5;
            return {
                posts: Posts.find({}, {
                    sort: {
                        submitted: -1
                    },
                    limit: limit
                })
            };
        }
    });
});

var requireLogin = function(pause) {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
        pause();
    }
};

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {
    only: 'postSubmit'
});
Router.onBeforeAction(function() {
    Errors.clearSeen();
});