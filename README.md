# Preview LaTeX maths and Images inline

**For markdown, [pandoc flavor markdown language](https://atom.io/packages/language-pfm)  (`language-pfm` package) is recommended**

Preview Latex formula and images embedded directly in your documents - no need to generate a full PDF or HTML preview to check your figures and formula! Works in Markdown (pandoc variety) and Tex files.

<!-- keep absolute path for atom package page -->
![screenshot of image-preview](https://raw.githubusercontent.com/mangecoeur/preview-inline/master/resources/demo.gif)


# Usage

Place your cursor within the image link or inside a math block and trigger `preview-inline: show` or use the default keyboard shortcut <kbd>ctrl</kbd>-<kbd>alt</kbd>-<kbd>p</kbd>.

Works with inline maths between `$` signs and blocks between `$$`, in markdown and LaTeX, as well as raw and latex code blocks in triple-backticks in Markdown. You can also select arbitrary regions to preview.

You might want to install the [pandoc flavor markdown language](https://atom.io/packages/language-pfm) (`language-pfm` package) first for support for math regions delimitated by '$' or '$$'. Otherwise only raw code and tex blocks in the standard github-markdown should work.

# Contribute

Contributions via pull request are welcome.
