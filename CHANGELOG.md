## 1.4.6
- Fixed not working on first load under certain conditions

## 1.4.1
- Added support for language-markdown math and image links

## 1.4.0
- added force reload button to image view
- now guesses file extension if not given in both markdown and latex - write the file name without the extension and it will attempt to find .jpg, .png. .gif, .svg files in that order

## 1.3.0
- Added zoom controls to image view
- Added basic support for Tex Images


## 1.2.0
- Converted project to ES6 to be more future proof
- Tweaks to activation
- Nicer menu label


## 1.1.1
- workaround for Atom uncaught error on scroll

## 1.0.4
- Fix for uncaught error

## 1.0.0
- Block decorations! Now requires Atom >1.6.0. Previews will be shown as blocks in between the text. A new option in the settings allows to revery to old behaviour. By default, previews for inline maths are still shown as overlays so that they can align with in-text formula.
- in the spirit of the npm-dependency meltdown, removed all non-critical dependencies (notably space-pen). Should also result in faster loading.
- bumped mathjax to latest version.

## 0.5.1
- math preview style tweaks
- fixes for image preview styles

## 0.5.0
- Removed KaTeX rendering, only use mathjax for improved display consistency
- Use SVG rendering for speed/consistency
- Use linter-themed bubbles (dark style)
- "Loading" animations for Tex rendering
- Updated Mathjax to 2.6 beta

## 0.4.3
- hotfix

## 0.4.2
- fix for inline math live update

## 0.4.1
- fixed bug with multiple open previews

## 0.4.0
- RELEASE CANDIDATE pending more in-use testing + bug tracking
- Added option for language associate (makes it possible to add other languages in future)
- Preview box should follow math as you type
- Math preview updates as you type

## 0.3.3
- Support for raw code and tex blocks

## 0.3.1
- replaced full MathJax bundle with stripped-down install, corrected path bug

## 0.3.0
- enabled mathjax and got it working (installs a complete MathJax, might be slow to install)


## 0.2.6
- fixed invalid call to mathjax (which was disabled in earlier version)

## 0.2.5
- disabled loading mathjax for now to speed up plugin loading

## 0.1.0 - First Release
