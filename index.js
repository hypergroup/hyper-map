/**
 * Module dependencies
 */

var Request = require('hyper-path');
var Emitter = require('component-emitter');
var debug = require('debug')('hyper-map');

/**
 * Expose the HyperMap
 */

module.exports = HyperMap;

/**
 * Create a HyperMap Client
 *
 * @param {Object?} resources
 * @param {Object?} errors
 */

function HyperMap(resources, errors) {
  this._resources = resources || {};
  this._errors = errors || {};
  this._completed = {};
  this.size = 0;
  for (var r in resources) {
    if (!resources.hasOwnProperty(r)) continue;
    this._completed[r] = true;
    this.size++;
  }
}
Emitter(HyperMap.prototype);

/**
 * Lookup a resource with the path and scope
 *
 * @param {String} path
 * @param {Object?} scope
 * @param {String?} delim
 * @return {Object}
 * @api public
 */

HyperMap.prototype.get = function(path, scope, delim) {
  var self = this;

  var client = createClient(self);
  var req = new Request(path, client, delim);
  req.scope(scope || {});

  return req.get(function(err, value) {
    if (err) throw err;
    return {
      completed: client.completed,
      value: value,
      request: req
    };
  });
};

/**
 * Set the value of a resource
 *
 * @param {String} href
 * @param {Object} value
 * @return {SyncClient}
 * @api public
 */

HyperMap.prototype.set = function(href, value) {
  this._resources[href] = value;
  if (!this._completed[href]) this.size++;
  this._completed[href] = true;
  return this;
};

/**
 * Set the error response for a resource
 *
 * @param {String} href
 * @param {Error} err
 * @return {SyncClient}
 * @api public
 */

HyperMap.prototype.error = function(href, err) {
  this._errors[href] = err;
  if (!this._completed[href]) this.size++;
  this._completed[href] = true;
  return this;
};

/**
 * Remove a resource from the store
 *
 * @param {String} href
 * @return {SyncClient}
 * @api public
 */

HyperMap.prototype.delete = function(href) {
  if (this._completed[href]) this.size--;
  delete this._resources[href];
  delete this._completed[href];
  delete this._errors[href];
  return this;
};

function createClient(map) {
  var client = {
    completed: true
  };
  client.root = root;
  client.get = get;

  return client;

  function root(cb) {
    return get('.', cb);
  }

  function get(href, cb) {
    map.emit('request', href);
    client.completed = client.completed && !!map._completed[href];
    var err = map._errors[href] || void 0;
    var val = map._resources[href];
    debug('fetching cache for ' + href, err, val);
    return cb(err, val);
  }
}
