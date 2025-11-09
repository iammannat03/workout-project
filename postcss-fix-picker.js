/**
 * PostCSS plugin to fix invalid ::picker(select) syntax from DaisyUI
 * The ::picker pseudo-element doesn't accept arguments, so we remove them
 */
export default function () {
  return {
    postcssPlugin: 'postcss-fix-picker',
    Once(root) {
      root.walkRules((rule) => {
        // Replace ::picker(select) with ::picker
        if (rule.selector) {
          rule.selector = rule.selector.replace(/::picker\(select\)/g, '::picker');
        }
      });
    },
  };
}

export const postcss = true;

