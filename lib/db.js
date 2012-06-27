(function() {
  "use strict";

  var config = require('../config').db
    , sqlite3 = require('sqlite3')
    , forEachAsync = require('forEachAsync')
    , db = new sqlite3.Database('../db/' + db.name)
    , checkExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='?';")
    ;

  db.serialize(function() {
    Object.keys(config.tableDefs).forEach(function(tableName) {
      checkExists.run(tableName);
    });
    checkExists.finalize();
  });

})();
