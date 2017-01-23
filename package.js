Package.describe({
  name: "artemi:reactive-observable-aggregations",
  version: "0.0.1",
  summary: "Reactively publish observable aggregations.",
  git: "https://github.com/urnix/meteor-reactive-observable-aggregations",
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.2.1");
  api.use("underscore");
  api.use("mongo");
  api.use("meteorhacks:aggregate@1.3.0");
  api.addFiles("aggregate.js");
  api.export("ReactiveObservableAggregate");
});
