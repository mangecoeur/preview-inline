# Preview LaTeX maths and Images inline

**Works best with [pandoc flavor markdown language](https://atom.io/packages/language-pfm)  (`language-pfm` package)**

Preview Latex formula and images embedded directly in your documents - no need to generate a full PDF or HTML preview to check your figures and formula!

![screenshot of image-preview](https://raw.githubusercontent.com/mangecoeur/preview-inline/master/resources/ScreenShot1.png)


# Usage

You might want to install the [pandoc flavor markdown language](https://atom.io/packages/language-pfm) (`language-pfm` package) first for support for math regions delimitated by '$' or '$$'. Otherwise only raw code and tex blocks in the standard github-markdown should work.

Place your cursor within the image link or inside a math block and trigger `preview-inline: show` or use the default keyboard shortcut <kbd>ctrl</kbd>-<kbd>alt</kbd>-<kbd>p</kbd>. Supported blocks include inline between `$` signs, pandoc style blocks between `$$`, as well as raw and latex code blocks in triple-backticks.

# Contribute

Contributions via pull request are welcome.
