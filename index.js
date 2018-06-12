const Fs = require('fs');
const Path = require('path');

const Loader = require('@assemblyscript/loader');

const Lib = require('./lib');

const Bin = Fs.readFileSync(Path.join(__dirname, 'build', 'untouched.wasm'));
const imports = {
    env: {
        log: function (x,y) {
            console.log(x, y, asmModule.getString(y));
        }
    }
};
const asmModule = Loader.instantiateBuffer(Bin, imports);

asmModule.getStringArray = Lib.getStringArray;

asmModule.newStringArray = Lib.newStringArray;


const pre = function (path, params) {
    const path_ptr = asmModule.newString(path);
    const params_ptr = asmModule.newStringArray(params);
    const result_ptr = asmModule.pre(path_ptr, params_ptr);

    const res = asmModule.getStringArray(result_ptr);
    if (res.length === 0) {
        return null;
    }

    return {
        status: res[0],
        record: {
            found: res[1],
            what: res[2]
        }
    };
};

console.log(pre('/etc/passwd', ['hello', '/etc/passwd']));
console.log(pre('/etc/secret/supersecret.txt', ['hello', '/etc/passwd']));
console.log(pre('documents/../../../../../../../../../etc/passwd', ['hello', '../../../../../../../../../etc/passwd']));
