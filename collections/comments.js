Comments = new Meteor.Collection('comments');

Meteor.methods({
  comment: function(commentAttributes) {
    var comment;
    var user = Meteor.user();
    var post = Posts.findOne({_id: commentAttributes.postId});

    if (!user) {
      throw new Meteor.Error(401, 'You need to login to make comments');
    }

    if (!commentAttributes.body) {
      throw new Meteor.Error(422, 'Please write some content');
    }

    if (!post) {
      throw new Meteor.Error(422, 'You must comment on a post');
    }

    comment = _.extend(_.pick(commentAttributes, 'postId', 'body'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });

    Posts.update(comment.postId, {$inc: {commentsCount: 1}});
    comment._id = Comments.insert(comment);
    createCommentNotification(comment);
    return comment._id;
  }
});