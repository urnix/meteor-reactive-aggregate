ReactiveObservableAggregate = function (sub, collection, pipeline, options) {
  var defaultOptions = {
    observeSelector: {}, observeOptions: {}, clientCollection: collection._name, watchItems: false
  };
  options = _.extend(defaultOptions, options);

  var initializing = true;
  if (options.watchItems) {
    sub.items = [];
  } else {
    sub._ids = {};
    sub._iteration = 1;
  }

  function update () {
    if (initializing) return;
    if (options.watchItems) {
      var items = collection.aggregate(pipeline);
      items.forEach(function (doc) {
        if (!_.findWhere(sub.items, doc)) {
          var index = _.pluck(sub.items, '_id').indexOf(doc._id);
          if (index < 0) {
            sub.added(options.clientCollection, doc._id, doc);
            sub.items.push(doc);
          } else {
            sub.changed(options.clientCollection, doc._id, doc);
            sub.items[index] = doc;
          }
        }
      });
      var toRemove = [];
      _.forEach(sub.items, function (doc) {
        if (!_.findWhere(items, {_id: doc._id})) {
          toRemove.push(doc);
          sub.removed(options.clientCollection, doc._id);
        }
      });
      sub.items = _.difference(sub.items, toRemove);
    } else {
      collection.aggregate(pipeline).forEach(function (doc) {
        if (!sub._ids[doc._id]) {
          sub.added(options.clientCollection, doc._id, doc);
        } else {
          sub.changed(options.clientCollection, doc._id, doc);
        }
        sub._ids[doc._id] = sub._iteration;
      });
      _.forEach(sub._ids, function (v, k) {
        if (v != sub._iteration) {
          delete sub._ids[k];
          sub.removed(options.clientCollection, k);
        }
      });
      sub._iteration++;
    }
  }

  var query = collection.find(options.observeSelector, options.observeOptions);
  var handle = query.observeChanges({
    added: update, changed: update, removed: update, error: function (err) {
      throw err;
    }
  });
  initializing = false;
  update();
  sub.ready();

  sub.onStop(function () {
    handle.stop();
  });
};
