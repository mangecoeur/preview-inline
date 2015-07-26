# Preview LaTeX maths and Images inline

**Requires [pandoc flavor markdown language](https://atom.io/packages/language-pfm)  (`language-pfm` package)**

Preview Latex formula and images embedded directly in your documents - no need to generate a full PDF or HTML preview to check your figures and formula!

![screenshot of image-preview](https://raw.githubusercontent.com/mangecoeur/preview-inline/master/resources/ScreenShot1.png)


# Install

Install the [pandoc flavor markdown language](https://atom.io/packages/language-pfm) (`language-pfm` package) first, since math and image text regions are determined based on their syntax scope

# Usage

Place your cursor within the image link or inside a math block and trigger `preview-inline: show` or use the default keyboard shortcut <kbd>ctrl</kbd>-<kbd>alt</kbd>-<kbd>p</kbd>. Supported blocks include inline between `$` signs, pandoc style blocks between `$$`, as well as raw and latex code blocks in triple-backticks.

# Contribute

Contributions via pull request are welcome.

## TODO

Non-exhaustive todo list:

- [ ] better support for non-markdown files
- [/] MathJax fallback for maths that KaTeX can't handle
- [ ] Live update of maths as you type with small delay
- [ ] Display preview as inline block instead of overlay (?)
- [ ] More test coverage
