module.exports = function () {

    var root = './';
    var samples = root + 'lib/';
    var lib = root + 'samples/';

    var config = {
        root: root,
        alljs: [
            root + '*.js',
            lib + '*.js',
            samples + '*.js'
        ],
        packages: [
            root + 'package.json'
        ],
    };

    return config;
};