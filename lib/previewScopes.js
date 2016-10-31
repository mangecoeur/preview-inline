'use babel';

const mathBlockScopes = ['markup.math.block',
                 'meta.function.environment.math.latex',
                 'markup.raw.gfm',
                 'markup.code.latex.gfm',
                 'string.other.math.block'
             ];
const mathInlineScopes = ['markup.math.inline', 'string.other.math.tex', 'string.other.math.latex'];
const inlineMathPattern = /\$(.*)\$/;
const imageScopes = ['markup.underline.link.gfm', 'text.tex.latex'];
const imagePatterns = {
  'markup.underline.link.gfm': /\((.*)\)/,
  'text.tex.latex': /\\includegraphics{(.*)}/
};

export default {mathBlockScopes, mathInlineScopes, imageScopes, inlineMathPattern, imagePatterns};
