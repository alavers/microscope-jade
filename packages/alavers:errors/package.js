Package.describe({
  summary: "A pattern to display application errors to the user",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.1.1');
  api.use(['minimongo', 'mongo-livedata', 'templating', 'waitingkuo:jade'], 'client');
  api.addFiles(['errors.js', 'errors_list.jade', 'errors_list.js'], 'client');

  if (api.export) {
    api.export('Errors');
  }
});

Package.onTest(function(api) {
  api.use('alavers:errors', 'client');
  api.use(['tinytest', 'test-helpers'], 'client');
  api.addFiles('errors_tests.js', 'client');
});
