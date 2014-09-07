var should = require('should');
var HyperMap = require('../');

describe('HyperMap', function() {
  describe('#get', function() {
    var client = new HyperMap({
      '.': {
        users: {
          href: '/users'
        }
      },
      '/users': {
        collection: [
          {href: '/users/1'}
        ]
      },
      '/users/1': {
        name: 'Mike'
      }
    });

    it('should return a root request synchronously', function() {
      var res = client.get('.users.0.name');
      should.exist(res);
      should.exist(res.value);
      res.value.should.eql('Mike');
    });

    it('should return a scoped request synchronously', function() {
      var res = client.get('users.0.name', {users: {href: '/users'}});
      should.exist(res);
      should.exist(res.value);
      res.value.should.eql('Mike');
    });
  });

  describe('#set', function() {
    var client;
    beforeEach(function() {
      client = new HyperMap();
    });

    it('should add a resource', function() {
      client.set('.', {
        foo: 'bar'
      });
      client.size.should.eql(1);
      client.get('.foo').value.should.eql('bar');
    });

    it('should not increment the size if a resource is already present', function() {
      var res = {
        foo: 'bar'
      };
      client.size.should.eql(0);

      client.set('.', res);
      client.size.should.eql(1);

      client.set('.', res);
      client.size.should.eql(1);
    });
  });

  describe('#delete', function() {
    var client;
    beforeEach(function() {
      client = new HyperMap({
        '.': {
          foo: 'bar'
        }
      });
    });

    it('should remove a resource', function() {
      client.size.should.eql(1);
      client.delete('.');
      client.size.should.eql(0);
      client.delete('.');
      client.size.should.eql(0);
    });
  });
});
