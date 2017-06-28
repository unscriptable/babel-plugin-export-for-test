"use strict";

exports.__esModule = true;
const bar_test = exports.bar_test = () => {};
const bar3_test = exports.bar3_test = () => {};


// this should not trigger export or be exported:
// export for test const noway () => {
//     return 'yay'
// }

const bar = exports.bar = () => {};
// foo

/*export for test*/const bar4_test = exports.bar4_test = () => {};

const bar2_test = exports.bar2_test = () => {};