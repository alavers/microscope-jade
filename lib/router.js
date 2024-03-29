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
            sort: this.sort,
            limit: this.limit()
        };
    },
    onBeforeAction: function() {
        this.postsSub = Meteor.subscribe('posts', this.findOptions());
    },
    posts: function() {
        return Posts.find({}, this.findOptions());
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

NewPostsListController = PostsListController.extend({
    sort: {
        submitted: -1,
        _id: -1
    },
    nextPath: function() {
        return Router.routes.newPosts.path({
            postsLimit: this.limit() + this.increment
        });
    }
});

BestPostsListController = PostsListController.extend({
    sort: {
        votes: -1,
        submitted: -1,
        _id: -1
    },
    nextPath: function() {
        return Router.routes.bestPosts.path({
            postsLimit: this.limit() + this.increment
        });
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
            return Posts.findOne(this.params._id);
        }
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

    this.route('home', {
        path: '/',
        controller: NewPostsListController
    });

    this.route('newPosts', {
        path: '/new/:postsLimit?',
        controller: NewPostsListController
    });

    this.route('bestPosts', {
        path: '/best/:postsLimit?',
        controller: BestPostsListController
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