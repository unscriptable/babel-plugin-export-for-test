//@flow
/*export for test*/ const bar_test = () => {}
/*export for test*/ const bar3_test = () => {}
export type Foo = {}

// this should not trigger export or be exported:
// export for test const noway () => {
//     return 'yay'
// }

export const bar = () => {}
// foo

/*export for test*/ const bar4_test = () => {}

export /* for test */ const bar2_test = () => {}
