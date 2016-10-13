'use babel';

const mathBlockScopes = ['markup.math.block',
                 'meta.function.environment.math.latex',
                 'markup.raw.gfm',
                 'markup.code.latex.gfm',
                 'string.other.math.block'
             ];
const mathInlineScopes = ['markup.math.inline', 'string.other.math.tex', 'string.other.math.latex'];
const imageScopes = ["markup.underline.link.gfm"];
const inlineMathPattern = /\$(.*)\$/;

export default {mathBlockScopes, mathInlineScopes, imageScopes, inlineMathPattern};
