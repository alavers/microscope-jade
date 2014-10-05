Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    waitOn: function() {
        return [Meteor.subscribe('notifications')];
    }
});

PostsListController = RouteController.extend({
    template: 'postsList',
    increment: 2,
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
    onBeforeAction: function() {
        this.postsSub = Meteor.subscribe('posts', this.findOptions());
    },
    posts: function() {
        return Posts.find({}, this.findOptions());
    },
    nextPath: function() {
        return this.route.path({
            postsLimit: this.limit() + this.increment
        });
    },
    data: function() {
        var hasMore = this.posts().count() === this.limit();
        return {
            posts: this.posts(),
            ready: this.postsSub.ready,
            nextPath: hasMore ? this.nextPath() : null
        };
    }
});

Router.map(function() {
    this.route('postPage', {
        path: '/posts/:_id',
        waitOn: function() {
            return [
                Meteor.subscribe('singlePost', this.params._id),
                Meteor.subscribe('comments', this.params._id)
            ];
        },
        data: function() {
            Posts.findOne(this.params._id);
        },
        controller: PostsListController
    });

    this.route('postSubmit', {
        path: '/submit',
        progress: {
            enabled: false
        }
    });

    this.route('postEdit', {
        path: '/edit/:_id',
        waitOn: function() {
            return Meteor.subscribe('singlePost', this.params._id);
        },
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