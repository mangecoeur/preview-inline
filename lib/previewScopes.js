'use babel';

const mathBlockScopes = ['markup.math.block',
                'block.math.markup.md',
                 'meta.function.environment.math.latex',
                 'markup.raw.gfm',
                 'markup.code.latex.gfm',
                 'string.other.math.block'
             ];
const mathInlineScopes = ['markup.math.inline', 'inline.math.markup.md', 'string.other.math.tex', 'string.other.math.latex'];
const inlineMathPattern = /\$(.*)\$/;
const imageScopes = ['link.markup.md',
                     'markup.underline.link.gfm',
                     'uri.underline.link.md',
                     'meta.group.braces.tex'];
const imagePatterns = {
  'markup.underline.link.gfm': /\((.*)\)/,
  'link.markup.md': /!\[.*\]\((.*)\)/,
  'uri.underline.link.md': /(.*)/,
  'meta.group.braces.tex': /{(.*)}/
};
const citationScopes = ['reference.variable.md', 'meta.citation.latex'];
const citationPatterns = {
  'reference.variable.md': /@(.*)/,
  'meta.citation.latex': /\\cite{(.*)}/
};
const tikzScopes = ['meta.function.environment.latex.tikz'];
export default {mathBlockScopes, mathInlineScopes,
  imageScopes, inlineMathPattern, imagePatterns,
  citationScopes, citationPatterns, tikzScopes};
