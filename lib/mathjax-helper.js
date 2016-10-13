'use babel';
//
// mathjax-helper
//
// This module will handle loading the MathJax environment and provide a wrapper
// for calls to MathJax to process LaTeX equations.
//
import path from 'path';

export default {
  //
  // Load MathJax environment
  //
  loadMathJax() {
    let script = document.createElement("script");
    script.addEventListener("load", () => configureMathJax()
    );
    script.type = "text/javascript";
    try {
      // script.src  = "atom://preview-inline/resources/MathJax-custom/MathJax.js?delayStartupUntil=configured"
      script.src = path.join(__dirname, "..", "resources",
                              // "MathJax-custom",
                              "mathjax-svg",
                              "MathJax.js?delayStartupUntil=configured");
      document.getElementsByTagName("head")[0].appendChild(script);
    } catch (error) {
      atom.notifications.addError(error.message);
    }
    finally {
      return;
    }
  },

  //
  // Process DOM elements for LaTeX equations with MathJax
  //
  // @param domElements An array of DOM elements to be processed by MathJax. See
  //   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  //   details on DOM elements.
  //
  mathProcessor(domElements, cb) {
    if (typeof MathJax !== 'undefined' && MathJax !== null) {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, domElements]);
      if (cb != null) {
        MathJax.Hub.Queue(cb);
      }
    }
  }
};

//
// Configure MathJax environment. Similar to the TeX-AMS_HTML configuration with
// a few unnessesary features stripped away
//
function configureMathJax() {
  MathJax.Hub.Config({
    // jax: ["input/TeX","output/CommonHTML"]
    jax: ["input/TeX", "output/SVG"],
    extensions: [],
    TeX: {
      extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
    },
    messageStyle: "none",
    showMathMenu: false,
    SVG: {
      scale: 120
    },
    CommonHTML: {
      scale: 120
    }
  });

  MathJax.Hub.Configured();
}
